import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

    async findAll(query: FilterUserDto): Promise<any> {
        const page = Number(query.page) || 1;
        const itemsPerpage = Number(query.itemsPerPage) || 10;
        const search = query.search || '';

        const [res, total] = await this.userRepository.findAndCount({
            select: ['id', 'email', 'firstName', 'lastName', 'status', 'create_at', 'update_at'],
            where: [
                { firstName: Like('%' + search + '%') },
                { lastName: Like('%' + search + '%') },
                { email: Like('%' + search + '%') }
            ],
            skip: (page - 1) * itemsPerpage,
            take: itemsPerpage,
            order: { create_at: 'DESC' }
        });

        const lastPage = Math.ceil(total / itemsPerpage);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return {
            data: res,
            total,
            currentPage: page,
            nextPage,
            prevPage,
            lastPage
        }
    }

    async findOne(id: number): Promise<User> {
        return await this.userRepository.findOneBy({ id });
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const hashPassword = await this.hashPassword(createUserDto.password);
        return await this.userRepository.save({ ...createUserDto, password: hashPassword });
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        return await this.userRepository.update(id, updateUserDto);
    }

    async deleteUser(id: number): Promise<DeleteResult> {
        return await this.userRepository.delete(id);
    }

    async updateAvatar(id: number, avatar: string): Promise<UpdateResult> {
        return await this.userRepository.update(id, { avatar })
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }


}
