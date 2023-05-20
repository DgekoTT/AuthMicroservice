import {IsNumber, IsString} from "class-validator";

export class UpdateProfileDto {
    @IsNumber({}, {message: 'Только числа'})
    readonly id: number;

    @IsString({message: " Должно быть строкой"})
    readonly fullName: string;

    @IsNumber({}, {message: 'Только числа'})
    readonly phone: number;

    @IsNumber({}, {message: 'Только числа'})
    readonly age: number;

    @IsString({message: " Должно быть строкой"})
    readonly city: string;
}