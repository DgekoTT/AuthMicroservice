import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mailer/mail.service';
import { GoogleLogin } from './strategy/google/googleLogin';
import { VkLogin } from './strategy/vk/vk.strategy';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserDto } from '../users/dto/auth-user.dto';
import { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import {GoogleLoginDto} from "./dto/login.google.dto";
import {CheckNameDto} from "./dto/check-name.dto";
import {CheckMailDto} from "./dto/check-mail.dto";

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    let usersService: UsersService;
    let mailService: MailService;
    let googleService: GoogleLogin;
    let vkService: VkLogin;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                UsersService,
                MailService,
                GoogleLogin,
                VkLogin,
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        mailService = module.get<MailService>(MailService);
        googleService = module.get<GoogleLogin>(GoogleLogin);
        vkService = module.get<VkLogin>(VkLogin);
    });


    describe('googleLogin', () => {
        it('по данным гугла должен вурнеть куки с токеном', async () => {
            const userDto: GoogleLoginDto = {
                email: 'test@example.com', displayName: "BoB"
            };

            const token = 'dasfsgsgsg';
            // @ts-ignore
            jest.spyOn(googleService, 'googleLogin').mockResolvedValue([{ email: 'test@example.com', displayName: "BoB"},token]);

            const response: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                cookie: jest.fn(),
            };

            await controller.googleLogin(userDto, response as Response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.cookie).toHaveBeenCalledWith(
                'refreshToken',
                token,
                expect.any(Object),
            );
        });
    });

    describe('login', () => {
        it('должен войти и вернуть токен в кукис', async () => {
            const userDto: AuthUserDto = {
                email: 'test@example.com', password: 'password',
            };

            const token = 'fakeToken';
            jest.spyOn(authService, 'login').mockResolvedValue(token);

            const response: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                cookie: jest.fn(),
            };

            await controller.login(userDto, response as Response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.cookie).toHaveBeenCalledWith(
                'refreshToken',
                token,
                expect.any(Object),
            );
        });
    });

    describe('registration', () => {
        it('должен пройти регистрацию и вернуть токен в кукис', async () => {
            const userDto: CreateUserDto ={
                email: 'test@example.com',
                password: 'password',
                displayName: "BoB" };

            const token = 'fakeToken';
            jest.spyOn(authService, 'registration').mockResolvedValue(token);

            const response: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                cookie: jest.fn(),
            };

            await controller.registration(userDto, response as Response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.cookie).toHaveBeenCalledWith(
                'refreshToken',
                token,
                expect.any(Object),
            );
        });
    });

    describe('logout', () => {
        it('должен убрать токен из кукис', async () => {
            const request: Partial<Request> = {
                cookies: {
                    refreshToken: 'fakeRefreshToken',
                },
            };

            const response: Partial<Response> = {
                clearCookie: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            };

            controller.logout(request as Request, response as Response);

            expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
        });
    });

    describe('refresh', () => {
        it('должен обновить токен', async () => {
            const userDto: AuthUserDto = {
                email: 'test@example.com', password: 'password',
            };

            const token = 'fakeToken';
            jest.spyOn(authService, 'login').mockResolvedValue(token);

            const request: Partial<Request> = {};

            const response: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                cookie: jest.fn(),
            };

            await controller.refresh(userDto, request as Request, response as Response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.cookie).toHaveBeenCalledWith(
                'refreshToken',
                token,
                expect.any(Object),
            );
        });
    });

    describe('checkMail', () => {
        it('должен проверить есть ли емайл в базе', async () => {
            const email: CheckMailDto = {
                email: 'mail@example.com',
            };

            const result = 'fakeResult';
            jest.spyOn(usersService, 'checkEmail').mockResolvedValue(result);

            const response = await controller.checkMail(email);

            expect(response).toBe(result);
        });
    });

    describe('checkName', () => {
        it('должен проверить есть ли имя в базе', async () => {
            const name: CheckNameDto = {
                displayName: 'фвыаыа',
            };

            const result = 'fakeResult';
            jest.spyOn(usersService, 'getUserByName').mockResolvedValue(result);

            const response = await controller.checkName(name);

            expect(response).toBe(result);
        });
    });

});
