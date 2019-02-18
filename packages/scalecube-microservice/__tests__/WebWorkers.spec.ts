import { IntervalWorkerServiceExample, IntervalWorkerServiceExampleDefinition } from '../__mocks__/ItnervalWorker';
import { getGreetingServiceInstance } from '../__mocks__/GreetingService';
import * as path from 'path';

import Worker from 'tiny-worker';
describe('Test webworker', () => {
  let workerService;
  let subscriber;

  // beforeEach(() => {
  //   workerService && workerService.close();
  //   subscriber && subscriber.close();
  // });

  it('Test IntervalWorker', () => {
    // expect.assertions(1);
    // @ts-ignore
    const workerPath = path.join(process.cwd() + '/__tests__/worker.js');
    console.log(workerPath);

    // @ts-ignore
    workerService = new Worker(workerPath);
    subscriber = workerService.postMessage(1000);
    //
    // subscriber.subscribe((res) => {
    //   console.log('res',res);
    //   workerService && workerService.close();
    //   expect(true).toBe(true);
    //   done();
    // });

    // const se = getGreetingServiceInstance();
    // se.greet$(['1','2','3']).subscribe((res)=>expect(res).toEqual(res));
  });
});
