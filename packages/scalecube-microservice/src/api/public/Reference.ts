import AsyncModel from './AsyncModel';

export default interface Reference {
  qualifier: string; // <serviceName/methodName>
  serviceName: string;
  methodName: string;
  reference?: {
    [mathodName: string]: (data: any) => any;
  };
  asyncModel: AsyncModel;
}