import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'Email or username is required' })
    @IsString()
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}
