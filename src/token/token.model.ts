import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";
import {ApiProperty} from "@nestjs/swagger";

interface TokenCreationAttrs {
    id: number;
    userId: number;
    refreshToken: string;
}

@Table({tableName: "Token"})
export class Token extends Model<User, TokenCreationAttrs> {

    @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
    @Column({type: DataType.INTEGER, autoIncrement: true, primaryKey: true})
    id: number

    @ApiProperty({example: 'dsfwrv35gdg35vs', description: 'jwt токен пользователя'})
    @Column({type: DataType.TEXT})
    refreshToken: string;

    @BelongsTo(() => User)
    user:User;

    @ApiProperty({example: '1', description: 'id пользователя из таблицы users'})
    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    userId: number;
}