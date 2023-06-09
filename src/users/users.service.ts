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

    async getAllUser(): Promise<User[]> {
        return await this.userRepository.findAll({include: {all: true}});
    }

    async checkEmail(email: string): Promise<string> {
        const user = await this.userRepository.findOne({where: { email: email}})
        return (user) ? `Пользователь с таким ${user.email} уже существует` : email
    }
    async getUserByEmail(email: string) : Promise<User> {
        return  await this.userRepository.findOne({where: {email: email}, include: {all: true}})
    }

    async getUserByName(displayName: string): Promise<string> {
        const user = await this.userRepository.findOne( {where: { displayName: displayName}})
         return (user) ? `Пользователь с таким ${user.displayName} уже существует` : displayName
    }

    async addRole(dto: AddRoleDto) : Promise<AddRoleDto> {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw  new HttpException('Подьзователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) : Promise<User>   {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Подьзователь не найдены', HttpStatus.NOT_FOUND);
        }
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save(); // сохраняем изменения в бд
        return user;
    }


    async delUser(data: number) : Promise<[User, string]> {
        const user = await this.checkUser(data);
        const res = await this.delPhase(data);
        return [user, res];
    }


    async delPhase(data: number) : Promise<string> {
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

    async findByVerificationToken(token: string)  : Promise<User>  {
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




    async createUserAdmin(dto: CreateUserDto)  : Promise<any>  {
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