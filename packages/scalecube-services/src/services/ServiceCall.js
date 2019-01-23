// @flow

import { Router, Message, utils, Microservices } from ".";
import { Observable } from "rxjs/Observable";
// import { pipe } from "rxjs/util/pipe";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/from";
import { isObservable } from "./utils";

import { from } from "rxjs6";
import { map, switchMap } from "rxjs6/operators";

export class ServiceCall {
    router: Router;
    microservices: Microservices;

    constructor(router: Router, ms: Microservices) {
        this.router = router;
        this.microservices = ms;
    }

    chain$({ message }) {
        return Observable
            .from([message])
            .map((message) => {
                if (Array.isArray(message.data)) {
                    return message;
                }
                throw Error("Message format error: data must be Array");
            })
            .map(message => ({
                message,
                inst: this.router.route(message)
            }))
            .map((source) => {
                if (source.inst && source.inst.service) {
                    return source;
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .map(source => ({
                inst: source.inst,
                message: source.message,
                thisMs: this.microservices,
                meta: source.inst.service.meta || source.inst.service.constructor.meta || {}
            }))
            .pipe(source$ => this.microservices.preRequest(source$))
            .map(obj => obj.inst)
            .switchMap(inst => utils.isLoader(inst) ?
                Observable.from(new Promise(r => inst.service.promise.then(res => r(res)))) :
                Observable.from([inst.service])
            )
            .map((service) => {
                if (service[message.method]) {
                    return service;
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .switchMap((service) => {
                const serviceMethod = service[message.method](...message.data);
                if ("Promise") {
                    return Observable.from(serviceMethod);
                } else {
                    if (isObservable(serviceMethod)) {
                        return serviceMethod;
                    } else {
                        throw Error(`Service method not observable error: ${message.serviceName}.${message.method}`);
                    }
                }
            });
    };

    chain2$({ message }) {
        return from([message])
            .pipe(
                map((message) => {
                    if (Array.isArray(message.data)) {
                        return message;
                    }
                    throw Error("Message format error: data must be Array");
                }),
                map(message => ({
                    message,
                    inst: this.router.route(message)
                })),
                map((source) => {
                    if (source.inst && source.inst.service) {
                        return source;
                    }
                    throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
                }),
                map(source => ({
                    inst: source.inst,
                    message: source.message,
                    thisMs: this.microservices,
                    meta: source.inst.service.meta || source.inst.service.constructor.meta || {}
                }))
            )
            .pipe(source$ => this.microservices.preRequest(source$))
            .pipe(
                map(obj => obj.inst),
            )
            .pipe(
                switchMap(inst => utils.isLoader(inst) ?
                    from(new Promise(r => inst.service.promise.then(res => r(res)))) :
                    from([inst.service])
                ),
                switchMap((service) => {
                    const serviceMethod = service[message.method](...message.data);

                    if (Object.prototype.toString.call(serviceMethod) === "[object Promise]"){
                        return from(serviceMethod);
                    }
                    console.log('serviceMethod', utils.isObservable(serviceMethod));
                    return serviceMethod;

                }),
                map(result => {
                    return result;
                })
            )
            ;
    };

    call(message: Message, type: "Observable" | "Promise") {

        return type === "Promise" ? this.chain2$({ message }).toPromise() : this.chain2$({ message });
    }

    invoke(message: Message): Promise<Message> {
        return this.call(message, "Promise");
    }

    listen(message: Message): Observable<Message> {
        return this.call(message, "Observable");
    }
}
