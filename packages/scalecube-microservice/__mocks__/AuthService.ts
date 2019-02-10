import { generateIdentifier } from '../src/helpers/utils';

class AuthService {
  public auth(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

const authServiceInstance = new AuthService();

authServiceInstance.constructor = authServiceInstance.constructor || {};
// tslint:disable-next-line
authServiceInstance.constructor['meta'] = {
  serviceName: 'AuthService',
  identifier: `${generateIdentifier()}`,
  methods: {
    auth: {
      asyncModel: 'Promise',
    },
  },
};

export { authServiceInstance };