import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`   /*получаем конфигурации
         для разработки и для продакшена, нужно npm i cross-env*/
        }),
        MailerModule.forRoot({
            transport: {
                host: "smtp.yandex.ru",
                port: 465,
                secure: true,
                auth: {
                    user: 'f1lm.new@yandex.ru',
                    pass: 'svjuuuddmodvgfhp'
                }
            }
    })],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
