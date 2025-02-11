import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterUserDto } from './dto/register_user.dto';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dto/login_user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
        return this.authService.register(registerUserDto);
    }

    @Post('login')
    @ApiResponse({status: 201, description: 'Login successfully!'})
    @ApiResponse({status: 401, description: 'Login fail!'})
    @UsePipes(ValidationPipe)
    login(@Body() loginUserDto: LoginUserDto): Promise<any> {
        return this.authService.login(loginUserDto);
    }

    @Post('refresh-token')
    refreshToken(@Body() { refresh_token }): Promise<any> {
        return this.authService.refreshToken(refresh_token);
    }
}
