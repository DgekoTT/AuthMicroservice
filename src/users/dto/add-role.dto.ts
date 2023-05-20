import {IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AddRoleDto{
    @ApiProperty({example: 'user', description: 'Описание роли пользователя'})
    @IsString({message: " Должно быть строкой"})
    readonly value: string;

    @ApiProperty({example: [1, 3, 7], description: 'FK из таблицы UserRoles,', isArray: true})
    @IsNumber({}, {message: 'Только числа'})
    readonly userId: number;
}