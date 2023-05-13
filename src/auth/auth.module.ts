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
import {MailModule} from "../mailer/mail.module";
import {GoogleStrategy} from "./strategy/google/google.strategy";
import {PassportModule} from "@nestjs/passport";
import {SessionSerializer} from "./strategy/google/Serializer";
import {VkStrategy} from "./strategy/vk/vk.strategy";


@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, VkStrategy, SessionSerializer],
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
      }),
      PassportModule.register({session: true})
  ],
    exports : [
        AuthService,
        JwtModule,
    ]
})
export class AuthModule {}
