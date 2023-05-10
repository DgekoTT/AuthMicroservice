//nest generate module auth создано командой
/*npm i @nestjs/jwt bcryptjs был установлен модуль для работы с
jwt token и шифрование паролей
 */
import {forwardRef, Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {JwtModule} from "@nestjs/jwt";
import {TokenModule} from "../token/token.module";
import {UsersModule} from "../users/users.module";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {MailService} from "../mailer/mail.service";
import {MailModule} from "../mailer/mail.module";


@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [MailModule, ClientsModule.register([
      {
          name: 'AUTH_SERVICE',
          transport: Transport.RMQ,
          options: {
              urls: ['amqp://localhost:5672'],
              queue: 'auth_queue',
              queueOptions: {
                  durable: false
              },
          },
      },
  ]),
      TokenModule,
      forwardRef(() => UsersModule) ,/* если не использовать форвард
      то будет круговая зависимость и выдаст ошибку */
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || "SECRET",
          signOptions: {//время жизни токена
            expiresIn: '24h'
          }
      })
  ],
    exports : [
        AuthService,
        JwtModule
    ]
})
export class AuthModule {}
