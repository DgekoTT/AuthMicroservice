//nest generate service auth создано командой

import {
    BadRequestException,
    HttpException,
    HttpStatus,
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
import {UserGoogle} from "./utils/googleTypes";
import {InjectModel} from "@nestjs/sequelize";
import {UsersGoogle} from "./strategy/google/google.model";


@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private jwtService: JwtService,
                private tokenService: TokenService,
                private mailService: MailService,
                @InjectModel(UsersGoogle) private googleRepository: typeof UsersGoogle,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {}

    async login(userDto: AuthUserDto ) {
        const user = await this.validateUser(userDto);
        const tokens =  await this.tokenService.generateToken(user);
        await this.tokenService.saveToken(user.id, tokens.refreshToken)
        return {...tokens};
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException(`Пользователь с таким ${userDto.email} 
            уже существует`, HttpStatus.BAD_REQUEST);
        }
        // получаем закодированный пароль
        const hasPassword = await bcrypt.hash(userDto.password, 6);
        // создаем токен для активации по почте
        const tokenVerification = this.generateVerificationToken();
        //создаем пользователя
        const user = await this.userService.createUser({...userDto, password: hasPassword, verificationToken: tokenVerification});

        // оправляем ссылку активации на почту
        await this.mailService.sendMail(user.email, tokenVerification);

        // возрашает токен на основе данных пользователя
        const tokens = await this.tokenService.generateToken(user);
        await this.tokenService.saveToken(user.id, tokens.refreshToken);
        return {...tokens};
    }


    private async validateUser(userDto: AuthUserDto) {
        //находим пользователя по емайл
        const candidate = await this.userService.getUserByEmail(userDto.email);
        // сравниваем пароли из бд и отправленный пользователем
        const passwordEquals = await bcrypt.compare(userDto.password, candidate.password);
        if (candidate && passwordEquals) {
            return candidate;
        }
        throw new UnauthorizedException({message: 'Некорректный емайл или пароль'})
    }

    async logout(refreshToken) {
        return await this.tokenService.removeToken(refreshToken);
    }

    private generateVerificationToken() {
        return crypto.randomBytes(20).toString('hex');
    }

    async verify(token: string) {
        const user = await this.userService.findByVerificationToken(token);
        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }
       return await this.userService.updateVerificationStatus(user);
    }

    async validateGoogle(info: UserGoogle): Promise<UsersGoogle> {
        const user = await this.googleRepository.findOne({
            where: {
                email: info.email
            }
        })
        if(user) return user;

        return  await this.googleRepository.create({...info, role: 'USER'});
    }

    async findGoogleUser(id: number) : Promise<UsersGoogle> {
        return await this.googleRepository.findOne({where: {id: id}})
    }
}
