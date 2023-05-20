import {BelongsToMany, Column, DataType, HasOne, Model, Table} from "sequelize-typescript";

import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-role.model";
import {Token} from "../token/token.model";
import {ApiProperty} from "@nestjs/swagger";


interface USerCreationAttrs {
    email: string;
    password: string;
    displayName: string;
    provider: string;
    verificationStatus?: boolean;
}

@Table({tableName: 'users'})//появится таблица с именем users
export class User extends Model<User, USerCreationAttrs> {

    @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    //получим id как число, уникальное автозаполненеие 1..2..3
    id: number;

    @ApiProperty({example: 'Петя', description: 'имя, ник или имя и фамилия пользователя'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    displayName: string;

    @ApiProperty({example: 'user@gmail.com', description: 'почта пользователя'})
    //allowNull: false не должен быть пустым
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @ApiProperty({example: 'sdW2!24%fc', description: 'пароль'})
    @Column({type: DataType.STRING, allowNull: false})
    password: string;

    @ApiProperty({example: 'true', description: 'забанен ли пользователь'})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;

    @ApiProperty({example: 'email', description: 'как быз зарегистрирован пользователь'})
    @Column({type: DataType.STRING, allowNull: true})
    provider: string;

    @ApiProperty({example: 'ругался матом в чат', description: 'причина бана'})
    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;

    /*создаем связь многий ко многим между пользователями и ролями
    содениние FK будет в таблице UserRoles
     */
    @ApiProperty({example: [1, 2], description: 'FK из таблицы UserRoles,', isArray: true})
    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[];

    @ApiProperty({example: Token, description: 'объект Jwt token'})
    @HasOne(() => Token)
    userToken: Token;

    @ApiProperty({example: 'true', description: 'подтвердил ли почту пользователь'})
    @Column({type: DataType.BOOLEAN})
    verificationStatus: boolean;

    @ApiProperty({example: 'dsd24f5gsgsgs', description: 'токен для подтверждения почты'})
    @Column({type: DataType.STRING})
    verificationToken: string


}