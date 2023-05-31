import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";

import {User} from "../users/user.model";
import {UserRoles} from "./user-role.model";
import {ApiProperty} from "@nestjs/swagger";
import {RoleCreationAttrs} from "../interfaces/roles.interfaces";



@Table({tableName: 'roles'})//появится таблица с именем roles
export class Role extends Model<Role, RoleCreationAttrs> {

    @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
        //получим id как число, уникальное автозаполненеие 1..2..3
    id: number;

    @ApiProperty({example: 'user', description: 'Описание роли пользователя'})
    //allowNull: false не должен быть пустым
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    value: string;

    @ApiProperty({example: 'user', description: 'Описание роли пользователя'})
    @Column({type: DataType.STRING, allowNull: false})
    description: string;

    /*создаем связь многий ко многим между пользователями и ролями
    содениние FK будет в таблице UserRoles
     */
    @ApiProperty({example: [1, 3, 7], description: 'FK из таблицы UserRoles,', isArray: true})
    @BelongsToMany(() => User, () => UserRoles)
    users: User[];
}