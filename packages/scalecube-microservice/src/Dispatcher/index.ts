import { EMPTY } from 'rxjs6';
import { switchMap, map, catchError } from 'rxjs6/operators';

import { ServiceCallRequest } from '../api/Dispatcher';
import { Message } from '../api/Message';
import { processMethodBaseOnLaziness$, enrichMsgData$ } from './actions';

export const createDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  console.log('creating dispatcher');
  return ({ message, type }: ServiceCallRequest) => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    console.log('dispatcher call: message', message);
    console.log('dispatcher call: type', type);

    const routerInstance = router.route({ serviceRegistry, request: message });
    const serviceInstance = routerInstance.service;
    const method = serviceInstance[message.methodName];

    const chain$ = enrichMsgData$({ msg: message, enrichMethod: getPreRequest$ }).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) => processMethodBaseOnLaziness$({ serviceInstance, method, msg })),
      switchMap((msg) => enrichMsgData$({ msg, enrichMethod: postResponse$ })),
      map((msg: Message) => msg.data)
    );

    console.log('chain$ as a response of dispatcher', chain$);

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
