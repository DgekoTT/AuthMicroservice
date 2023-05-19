import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport} from "@nestjs/microservices";

/*"listen":"nest start --watch --config listener.json",
что бы микросервис работал параллельно с прослушивание прота
добавляем в package.json*/
async function microService() {

    const app = await NestFactory.createMicroservice(AppModule,{
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://localhost:5672'],
            queue: 'prof_queue',
            queueOptions: {
                durable: false
            },
        },
    });

    await app.listen();
    console.log("MicroService Auth is listening")
}


microService();