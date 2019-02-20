import { Message } from '../api2/public';
import { GetProxyOptions } from '../api2/private/types';
import { getQualifier } from '../helpers/serviceData';

const allowedMethodTypes = ['Promise', 'Observable'];

export const getProxy = ({ serviceCall, serviceDefinition }: GetProxyOptions) => {
  return new Proxy(
    {},
    {
      get: preServiceCall({ serviceDefinition, serviceCall }),
    }
  );
};

const preServiceCall = ({ serviceCall, serviceDefinition }: GetProxyOptions) => (target: object, prop: string) => {
  if (!serviceDefinition.methods[prop]) {
    throw new Error(`service method '${prop}' missing in the metadata`);
  }
  const { asyncModel } = serviceDefinition.methods[prop];
  if (!allowedMethodTypes.includes(asyncModel)) {
    throw new Error(`service method unknown type error: ${serviceDefinition.serviceName}.${prop}`);
  }

  return (...data: any[]) => {
    const message: Message = {
      qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
      data,
    };
    return serviceCall({ message, asyncModel });
  };
};
