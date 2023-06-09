//nest generate service auth создано командой

import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';

import {UsersService} from "../users/users.service";
import {TokenService} from "../token/token.service";
import {AuthUserDto} from "../users/dto/auth-user.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import * as bcrypt from 'bcryptjs';
import {ClientProxy} from "@nestjs/microservices";
import {JwtService} from "@nestjs/jwt";
import * as crypto from 'crypto';
import {MailService} from "../mailer/mail.service";
import {User} from "../users/user.model";
import {UserInfo} from "../interfaces/userInfo.interfaces";
import {CreateUserVkGoogleDto} from "../users/dto/create-VkUserGoogle.dto";


@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private jwtService: JwtService,
                private tokenService: TokenService,
                private mailService: MailService,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {}

    async login(userDto: AuthUserDto ): Promise<string> {
        const user = await this.validateUser(userDto);
        const token =  await this.tokenService.generateToken(user);
        await this.tokenService.saveToken(user.id, token)
        return token;
    }

    async registration(userDto: CreateUserDto): Promise<string>  {
        // получаем закодированный пароль
        const hasPassword = await bcrypt.hash(userDto.password, 6);
        // создаем токен для активации по почте
        const tokenVerification = this.generateVerificationToken();
        //создаем пользователя
        const [user, token] = await this.userService.createUser({...userDto, password: hasPassword, verificationToken: tokenVerification});
        // оправляем ссылку активации на почту
        await this.mailService.sendMailVerification(user.email, tokenVerification);
        // возрашает токен на основе данных пользователя
        return token;
    }


  async validateUser(userDto: AuthUserDto): Promise<User>  {
        //находим пользователя по емайл
        const candidate = await this.userService.getUserByEmail(userDto.email);
        // сравниваем пароли из бд и отправленный пользователем
        const passwordEquals = await bcrypt.compare(userDto.password, candidate.password);
        if (candidate && passwordEquals) {
            return candidate;
        }
        throw new UnauthorizedException({message: 'Некорректный емайл или пароль'})
    }

    async logout(refreshToken): Promise<number>  {
        return await this.tokenService.removeToken(refreshToken);
    }

   generateVerificationToken(): string {
        return crypto.randomBytes(20).toString('hex');
    }

    async verify(token: string): Promise<any>  {
        const user = await this.userService.findByVerificationToken(token);
        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }
       return await this.userService.updateVerificationStatus(user);
    }

    async validateGoogleOrVk(info: CreateUserVkGoogleDto): Promise<[User, string]>  {
        const user = await this.userService.getUserByEmail(info.email)
        if(user){
            const token =  await this.tokenService.generateToken(user);
            await this.tokenService.saveToken(user.id, token)
            return [user, token];
        }
        return await this.userService.createUser(info);
    }


    async registrationAdmin(userDto: CreateUserDto) : Promise<string> {
        // получаем закодированный пароль
        const hasPassword = await bcrypt.hash(userDto.password, 6);
        // создаем токен для активации по почте
        const tokenVerification = this.generateVerificationToken();
        //создаем пользователя
        const [user, token] = await this.userService.createUserAdmin({...userDto, password: hasPassword, verificationToken: tokenVerification});
        // оправляем ссылку активации на почту
        await this.mailService.sendMailVerification(user.email, tokenVerification);
        // возрашает токен на основе данных пользователя
        return token;
    }

    getUserInfo(refreshToken: any): UserInfo {
       const info = this.jwtService.verify(refreshToken, {secret: "FFFGKJKFWMV"})
       return {
           email: info.email,
           id: info.id,
           roles: info.roles.map(el => el.value),
           displayName: info.displayName
       };
    }
}
