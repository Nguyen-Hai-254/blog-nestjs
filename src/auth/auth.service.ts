import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from "bcrypt";
import { LoginUserDto } from './dto/login_user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async register(registerUserDto: RegisterUserDto): Promise<User> {
        const hashPassword = await this.hashPassword(registerUserDto.password);
        return await this.userRepository.save({ ...registerUserDto, password: hashPassword });
    }

    async login(loginUserDto: LoginUserDto): Promise<any> {
        const findUser = await this.userRepository.findOne({
            where: {
                email: loginUserDto.email
            }
        })

        if (!findUser) {
            throw new HttpException("Email is not exist", HttpStatus.UNAUTHORIZED);
        }

        const checkPassword = await bcrypt.compare(loginUserDto.password, findUser.password);
        if (!checkPassword) {
            throw new HttpException("Password is not correct", HttpStatus.UNAUTHORIZED);
        }

        const payload = { id: findUser.id, email: findUser.email };
        return this.generateToken(payload);
    }

    async refreshToken(refresh_token: string): Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refresh_token, { secret: this.configService.get<string>('SECRET') });
            const checkExistToken = await this.userRepository.findOneBy({
                email: verify.email,
                refresh_token
            })

            if (checkExistToken) {
                return this.generateToken({ id: verify.id, email: verify.email });
            }
            else {
                throw new HttpException("Refresh token is not valid", HttpStatus.BAD_REQUEST);
            }
        } catch (e) {
            throw new HttpException("Refresh token is not valid", HttpStatus.BAD_REQUEST);
        }
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }

    private async generateToken(payload: { id: number, email: string }) {
        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET'),
            expiresIn: this.configService.get<string>('EXPIRESIN_REFRESH_TOKEN')
        });

        await this.userRepository.update({
            email: payload.email
        }, { refresh_token: refresh_token })

        return { access_token, refresh_token };
    }
}
