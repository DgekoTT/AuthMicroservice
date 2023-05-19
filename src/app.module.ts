import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./users/user.model";
import {Role} from "./roles/roles.model";
import {UserRoles} from "./roles/user-role.model";
import {UsersModule} from "./users/users.module";
import {RolesModule} from "./roles/roles.module";
import {AuthModule} from "./auth/auth.module";
import {TokenModule} from "./token/token.module";
import {Token} from "./token/token.model";
import {ConfigModule} from "@nestjs/config";
import {MailModule} from "./mailer/mail.module";
import {PassportModule} from "@nestjs/passport";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {RolesGuard} from "./auth/role.guard";
import {Reflector} from "@nestjs/core";




@Module({
  controllers: [AppController],
  providers: [AppService, Reflector, JwtAuthGuard, RolesGuard],
  imports: [ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`   /*получаем конфигурации
  для разработки и для продакшена, нужно npm i cross-env*/
   }),
    SequelizeModule.forRoot({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    models: [User, Role, UserRoles, Token],
    autoLoadModels: true
  }),
      PassportModule.register({ session: true }),
    UsersModule,
    RolesModule,
    AuthModule,
    TokenModule,
    MailModule,]
})
export class AppModule {}

