import {IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class BanUserDto{
    @ApiProperty({example: '4', description: 'id пользователя для бана'})
    @IsNumber({}, {message: 'Только числа'})
    readonly userId: number;

    @ApiProperty({example: 'ругался матом в чат', description: 'причина бана'})
    @IsString({message: " Должно быть строкой"})
    readonly banReason: string;
}