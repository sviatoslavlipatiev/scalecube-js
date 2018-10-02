import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Transport} from "../src/Transport";
import {RSocketProvider} from "../src/provider/RSocketProvider";
import {RSocketServerProvider} from "../src/provider/RSocketServerProvider";
import {socketURI} from "./utils";
import {getTextResponseSingle, getTextResponseMany} from "../src/utils";


describe('Transport server test suite', () => {

  const text = 'Hello world';
  let transport;
  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(RSocketServerProvider, {});
    await transport.setProvider(RSocketProvider, { URI: socketURI });
    return transport;
  };

  afterEach(async () => {
    await transport.removeProvider();
  });

  it('Listen for "greeting/one" - sends one response and the stream is completed', async (done) => {
    expect.assertions(1);
    const result = getTextResponseSingle(text);
    await prepareTransport();

    transport.listen('/greeting/one', request => Observable.of(getTextResponseSingle(request.data)));
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/one' });
    stream.subscribe(
      data => expect(data).toEqual(result),
      undefined,
      () => done()
    );
  });

  it('Listen for "greeting/many" with responsesLimit = 3 - sends 3 responses and the stream is completed', async (done) => {
    expect.assertions(4);
    await prepareTransport();

    transport.listen('/greeting/many', (request) => {
      return Observable
        .interval(100)
        .map((index) => getTextResponseMany(index)(request.data));
    });
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 3 }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      },
      undefined,
      async () => {
        expect(updates).toEqual(3);
        done();
      }
    );
  });

  it('Listen for "greeting/many" without responsesLimit sends infinite amount of responses and the stream is not completed', async (done) => {
    await prepareTransport();

    transport
      .listen('/greeting/many', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseMany(index)(request.data));
      });
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });

    let updates = 0;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      },
      undefined
    );

    setTimeout(async () => {
      expect(updates > 15);
      subscription.unsubscribe();
      done();
    }, 2000);
  });

});

