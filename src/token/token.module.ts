import {Module} from "@nestjs/common";
import {TokenService} from "./token.service";
import {SequelizeModule} from "@nestjs/sequelize";
import {Token} from "./token.model";
import {User} from "../users/user.model";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";

@Module({
    providers: [TokenService],
    imports: [ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`   /*получаем конфигурации
  для разработки и для продакшена, нужно npm i cross-env*/
    }),
        SequelizeModule.forFeature([Token, User]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY,
            signOptions: {//время жизни токена
                expiresIn: '24h'
            }
        })],
    exports: [
        TokenService
    ]
})
 export class TokenModule{}