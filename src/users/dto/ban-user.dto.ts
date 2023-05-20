import {IsNumber, IsString} from "class-validator";

export class BanUserDto{
    @IsNumber({}, {message: 'Только числа'})
    readonly userId: number;

    @IsString({message: " Должно быть строкой"})
    readonly banReason: string;
}