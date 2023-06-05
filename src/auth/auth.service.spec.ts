import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokenService } from '../token/token.service';
import { MailService } from '../mailer/mail.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUserDto } from '../users/dto/auth-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { User } from '../users/user.model';
import * as bcrypt from 'bcryptjs';
import {Token} from "../token/token.model";


describe('AuthService', () => {
    let authService: AuthService;
    let userService: UsersService;
    let tokenService: TokenService;
    let mailService: MailService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        getUserByEmail: jest.fn(),
                        createUser: jest.fn(),
                        createUserAdmin: jest.fn(),
                        findByVerificationToken: jest.fn(),
                        updateVerificationStatus: jest.fn(),
                    },
                },
                { provide: TokenService, useValue: {} },
                { provide: MailService, useValue: {} },
                { provide: JwtService, useValue: {} },
            ],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        userService = moduleRef.get(UsersService);
        tokenService = moduleRef.get(TokenService);
        mailService = moduleRef.get(MailService);
        jwtService = moduleRef.get(JwtService);
    });

    describe('login', () => {
        it('должен вернуть токен если авторизация успешна', async () => {
            const userDto: AuthUserDto = { email: 'test@example.com', password: 'password' };
            const mockUser = new User();
            const mockToken = 'mockToken';
            jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
            jest.spyOn(tokenService, 'generateToken').mockResolvedValue(mockToken);
            jest.spyOn(tokenService, 'saveToken').mockResolvedValue({refreshToken: 'sfsfsfsfsfsf'} as Token);

            const result = await authService.login(userDto);

            expect(authService.validateUser).toHaveBeenCalledWith(userDto);
            expect(tokenService.generateToken).toHaveBeenCalledWith(mockUser);
            expect(tokenService.saveToken).toHaveBeenCalledWith(mockUser.id, mockToken);
            expect(result).toBe(mockToken);
        });

        it('должен вернуть ошибку если авторизация провалена', async () => {
            const userDto: AuthUserDto = { email: 'test@example.com', password: 'password' };
            jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException());

            await expect(authService.login(userDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('registration', () => {
        it('должен зарегистрировать пользователя и вернуть токен', async () => {
            const userDto: CreateUserDto = { email: 'test@example.com', password: 'password', displayName: "BoB" };
            const mockUser = new User();
            const mockToken = 'mockToken';
            const mockVerificationToken = 'mockVerificationToken';
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            jest.spyOn(authService, 'generateVerificationToken').mockReturnValue(mockVerificationToken);
            jest.spyOn(userService, 'createUser').mockResolvedValue([mockUser, mockToken]);
            jest.spyOn(mailService, 'sendMailVerification').mockReturnValue(userDto.email as never);

            const result = await authService.registration(userDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 6);
            expect(authService.generateVerificationToken).toHaveBeenCalledTimes(1);
            expect(userService.createUser).toHaveBeenCalledWith({
                ...userDto,
                password: 'hashedPassword',
                verificationToken: mockVerificationToken,
            });
            expect(mailService.sendMailVerification).toHaveBeenCalledWith(mockUser.email, mockVerificationToken);
            expect(result).toBe(mockToken);
        });
    });

    describe('validateUser', () => {
        it('должен проверить существует ли пользоавтель и вернуть его', async () => {
            const userDto: AuthUserDto = { email: 'test@example.com', password: 'password' };
            const mockUser = new User();
            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const result = await authService.validateUser(userDto);

            expect(userService.getUserByEmail).toHaveBeenCalledWith(userDto.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(userDto.password, mockUser.password);
            expect(result).toBe(mockUser);
        });

        it('кидает ошибку UnauthorizedException когда валидация провалена', async () => {
            const userDto: AuthUserDto = { email: 'test@example.com', password: 'password' };
            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(undefined);

            await expect(authService.validateUser(userDto)).rejects.toThrow(UnauthorizedException);
        });

        it('кидает ошибку UnauthorizedException если пароль не подходит', async () => {
            const userDto: AuthUserDto = { email: 'test@example.com', password: 'password' };
            const mockUser = new User();
            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            await expect(authService.validateUser(userDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('registrationAdmin', () => {
        it('должен зарегистрировать админа и вернуть токен', async () => {
            const userDto: CreateUserDto = { email: 'test@example.com', password: 'password', displayName: 'ADMIN' };
            const mockUser = new User();
            const mockToken = 'mockToken';
            const mockVerificationToken = 'mockVerificationToken';
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            jest.spyOn(authService, 'generateVerificationToken').mockReturnValue(mockVerificationToken);
            jest.spyOn(userService, 'createUserAdmin').mockResolvedValue([mockUser, mockToken]);
            jest.spyOn(mailService, 'sendMailVerification').mockReturnValue(userDto.email as never);

            const result = await authService.registrationAdmin(userDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 6);
            expect(authService.generateVerificationToken).toHaveBeenCalledTimes(1);
            expect(userService.createUserAdmin).toHaveBeenCalledWith({
                ...userDto,
                password: 'hashedPassword',
                verificationToken: mockVerificationToken,
            });
            expect(mailService.sendMailVerification).toHaveBeenCalledWith(mockUser.email, mockVerificationToken);
            expect(result).toBe(mockToken);
        });
    });
});
