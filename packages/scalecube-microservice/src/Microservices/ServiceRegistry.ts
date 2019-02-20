import { AddServicesToRegistryOptions, GetServicesFromRawServiceOptions } from '../api2/private/types';
import { ServiceRegistry, Service, LookupOptions, Endpoint } from '../api2/public';

export const lookUp = ({ qualifier, serviceRegistry }: LookupOptions): Endpoint[] => serviceRegistry[qualifier];

export const addServicesToRegistry = ({
  services = [],
  serviceRegistry,
}: AddServicesToRegistryOptions): ServiceRegistry =>
  getUpdatedServiceRegistry({
    serviceRegistry,
    endpoints: getEndpointsFromServices({ services }),
  });

// Helpers

export const getEndpointsFromServices = ({ services }: { services: Service[] }) =>
  services.reduce((res: Endpoint[], service: Service) => [...res, ...getEndpointsFromService({ service })], []);

export const getUpdatedServiceRegistry = ({
  serviceRegistry,
  endpoints,
}: {
  serviceRegistry: ServiceRegistry;
  endpoints: Endpoint[];
}) => ({
  ...serviceRegistry,
  ...endpoints.reduce((res: ServiceRegistry, endpoint: Endpoint) => {
    return {
      ...res,
      [endpoint.qualifier]: [...res[endpoint.qualifier], endpoint],
    };
  }, {}),
});

export const getEndpointsFromService = ({ service }: GetServicesFromRawServiceOptions): Endpoint[] | [] => {
  let endpoints: Endpoint[] | [] = [];
  const { definition, implementation } = service;
  const { serviceName } = definition;
  const transport = '';

  if (definition && definition.methods) {
    endpoints = Object.keys(definition.methods).map((methodName: string) => ({
      uri: `${transport}/${serviceName}/${methodName}`,
      qualifier: `${serviceName}/${methodName}`,
      transport,
      serviceName,
      methodName,
      methodPointer: {
        [methodName]: implementation[methodName],
      },
      context: implementation,
    }));
  }

  return endpoints;
};