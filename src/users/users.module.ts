// этот модуль мы создали командой nest generate module users
//при этом модуль автоматически добавился в файл app.modules

import {forwardRef, Module} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./user.model";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-role.model";
import {RolesModule} from "../roles/roles.module";
import {TokenModule} from "../token/token.module";
import {Token} from "../token/token.model";
import {AuthModule} from "../auth/auth.module";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {MailModule} from "../mailer/mail.module";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [ClientsModule.register([
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
      SequelizeModule.forFeature([User, Role, UserRoles, Token]),// массив моделей
      RolesModule,
      TokenModule,
      MailModule,
      forwardRef(() => AuthModule)/* если не использовать форвард,
      то будет круговая зависимость и выдаст ошибку */
  ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
