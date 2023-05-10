import {BelongsToMany, Column, DataType, HasOne, Model, Table} from "sequelize-typescript";

import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-role.model";
import {Token} from "../token/token.model";


interface USerCreationAttrs {
    email: string;
    password: string;
}

@Table({tableName: 'users'})//появится таблица с именем users
export class User extends Model<User, USerCreationAttrs> {

    // появятся указю колонки
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    //получим id как число, уникальное автозаполненеие 1..2..3
    id: number;


    //allowNull: false не должен быть пустым
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;


    @Column({type: DataType.STRING, allowNull: false})
    password: string;


    @Column({type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;


    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;

    /*создаем связь многий ко многим между пользователями и ролями
    содениние FK будет в таблице UserRoles
     */
    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[];

    @HasOne(() => Token)
    userToken: Token;

    @Column({type: DataType.BOOLEAN})
    verificationStatus: boolean;

    @Column({type: DataType.STRING})
    verificationToken: string


}