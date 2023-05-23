// этот модуль мы создали командой nest generate service users

import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {User} from "./user.model";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {ClientProxy} from "@nestjs/microservices";
import { randomBytes } from 'crypto';
import {MailService} from "../mailer/mail.service";
import {TokenService} from "../token/token.service";
import {Op} from "sequelize";
import {CreateUserVkGoogleDto} from "./dto/create-VkUserGoogle.dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService,
                private mailService: MailService,
                private tokenService: TokenService,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {
    }

    async createUser(dto: CreateUserDto | CreateUserVkGoogleDto): Promise<[User, string]> {
        let user;

        if (dto.password) {
            //создаем пользователя
            user = await this.userRepository.create({...dto, provider: `mail`});
        } else {
            user = await this.makeGoogleOrVkUser(dto);
        }
        //получаем роль из базы
        const role = await this.roleService.getRoleByValue("user");
        //перезаписаваем значение атрибу роль у пользователя в виде ид роли
        await user.$set('roles', [role.id]);
        user.roles = [role];
        // возрашает токен на основе данных пользователя
        const token = await this.tokenService.generateToken(user);
        await this.tokenService.saveToken(user.id, token);
        return [user, token];
    }

    async getAllUser() {
        return await this.userRepository.findAll({include: {all: true}});
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({where: {email}, include: {all: true}})
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw  new HttpException('Подьзователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Подьзователь не найдены', HttpStatus.NOT_FOUND);
        }
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save(); // сохраняем изменения в бд
        return user;
    }


    async delUser(data: number): Promise<[User, string]> {
        const user = await this.checkUser(data);
        const res = await this.delPhase(data);
        return [user, res];
    }


    async delPhase(data: number): Promise<string> {
        try {
            const success = await this.userRepository.destroy({
                where: {
                    id: data
                }
            });
            return `Пользователь с id ${data} удален`;

        } catch (e) {
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async checkUser(id: number): Promise<any> {
        const user = await this.userRepository.findByPk(id, {include: {all: true}});

        if (!user) {
            throw new HttpException(`Пользователь с id ${id} не найден `, HttpStatus.NOT_FOUND)
        }

        return user;
    }

    async getUserById(id: number): Promise<User> {
        return await this.checkUser(id);
    }

    async findByVerificationToken(token: string) {
        return await this.userRepository.findOne({
            where: {
                verificationToken: token
            }
        });
    }

    async updateVerificationStatus(user: User): Promise<any> {
        try {
             await user.update({verificationStatus: true}, {
                where: {
                    id: user.id
                }
            })
        } catch (e) {
            return (e.message)
        }

    }

    private async makeGoogleOrVkUser(dto: CreateUserVkGoogleDto): Promise<User> {
        const password = randomBytes(14).toString('hex');
        this.mailService.sendMailPass(dto.email, password)
        return await this.userRepository.create({...dto, password: password, verificationStatus: true})
    }

    async checkDto(email: string, displayName: string, password: string) {
        const {rows, count} = await this.userRepository.findAndCountAll({
            where: {
                [Op.or]: [{email}, {displayName}]
            }
        })
        this.showProblem(rows, count, password, email)
        }


    private showProblem(rows: User[], count: number, password: string, email: string) {
        if(!password) throw new HttpException(`Укажите пароль от 8 до 16 символов`, HttpStatus.BAD_REQUEST);
        if (count > 0) {
            if (rows[0].email === email) {
                throw new HttpException(`Пользователь с таким ${rows[0].email} уже существует`, HttpStatus.BAD_REQUEST,);
            } else {
                throw new HttpException(`Пользователь с таким ${rows[0].displayName} уже существует`, HttpStatus.BAD_REQUEST);
            }
        }
    }

    async createUserAdmin(dto: CreateUserDto) {
        let user;
        if (dto.password) {
            //создаем пользователя
            user = await this.userRepository.create({...dto, provider: `mail`});
        } else {
            user = await this.makeGoogleOrVkUser(dto);
        }
        await this.roleService.createRoles()
        //получаем роль из базы
        const role = await this.roleService.getRoleByValue("admin");
        //перезаписаваем значение атрибу роль у пользователя в виде ид роли
        await user.$set('roles', [role.id]);
        user.roles = [role];
        // возрашает токен на основе данных пользователя
        const token = await this.tokenService.generateToken(user);
        await this.tokenService.saveToken(user.id, token);
        return [user, token];
    }
}