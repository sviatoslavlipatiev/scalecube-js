import { updateServiceRegistry } from './ServiceRegistry';
import { AsyncServiceLoader } from '../api/Service';

export default class MicroServiceBuilder {
  private serviceRegistry: object;
  private preRequestCallBack: any;
  private postResponseCallBack: any;

  constructor() {
    this.serviceRegistry = {};
  }

  services(...services: []): MicroServiceBuilder {
    this.serviceRegistry = services.map((rawService) =>
      updateServiceRegistry({
        rawService,
        serviceRegistry: this.serviceRegistry,
      })
    );

    return this;
  }

  loadServiceAsync(...asyncServices: AsyncServiceLoader[]): MicroServiceBuilder {
    // TODO implement loadServiceAsync
    return this;
  }

  preRequest$(preRequest$): MicroServiceBuilder {
    this.preRequestCallBack = preRequest$;

    return this;
  }

  postResponse$(postResponse$): MicroServiceBuilder {
    this.postResponseCallBack = postResponse$;

    return this;
  }

  asProxy() {
    return Object.freeze({
      contract: ({ serviceContract }) => {
        const serviceRegistry = { ...this.serviceRegistry };
        const preRequest = this.preRequest$;
        const postResponse = this.postResponse$;

        //return new ProxyContext({serviceRegistry, preRequest, postResponse, serviceContract});
      },
    });
  }
}
