import { Microservices } from "../Microservices";

export interface DispatcherContextI {
    myrouter: any;
    timeout: number;
    microservices: Microservices;
}
