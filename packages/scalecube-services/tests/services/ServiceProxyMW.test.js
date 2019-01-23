import GreetingService from "examples/GreetingServiceClass/GreetingService.js";
import { Microservices } from "../../src/services";
import { Observable } from "rxjs";
import { map } from "rxjs6/operators";

describe("Service proxy middleware suite", () => {
    it("MW should add idan", () => {
        const greetingService = Microservices
            .builder()
            .preRequest((req$) => {
                console.log("req$", req$);
                return req$.pipe(
                    map(req => {
                        req.message.data.push("Idan");
                        return req;
                    })
                );
            })
            .services(new GreetingService(), new GreetingService())
            .build()
            .proxy()
            .api(GreetingService)
            .create();


        expect.assertions(1);
        return expect(greetingService.hello()).resolves.toEqual("Hello Idan");
    });
    it("MW should get service definition and microservices", () => {
        expect.assertions(6);

        const ms = Microservices
            .builder()
            .preRequest((message) => {
                return message.pipe(
                    map((msg => {
                        expect(msg.thisMs).toEqual(ms);
                        expect(msg.meta).toEqual(GreetingService.meta);
                        expect(msg.message.data).toEqual(["Idan"]);
                        expect(msg.message.method).toEqual("hello");
                        expect(msg.message.serviceName).toEqual("GreetingService");
                        return msg;
                    }))
                );
            })
            .services(new GreetingService(), new GreetingService())
            .build();
        const greetingService = ms.proxy()
            .api(GreetingService)
            .create();

        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
});
