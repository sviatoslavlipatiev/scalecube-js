import { fromEvent, of } from 'rxjs6';
import Worker from 'tiny-worker';

export const IntervalWorkerServiceExample = class {
  private readonly worker: any;

  constructor() {
    this.worker = new Worker('./worker.js');
  }

  interval(period: number) {
    console.log('period', period);
    this.worker.postMessage(period);
    return of({}); //fromEvent(this.worker, 'message');
  }

  close() {
    console.warn('worker terminate');
    this.worker.terminate();
    return Promise.resolve(true);
  }
};

export const IntervalWorkerServiceExampleDefinition = {
  methods: {
    interval: {
      asyncModel: 'Observable',
    },
    close: {
      asyncModel: 'Promise',
    },
  },
};
