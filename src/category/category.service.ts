import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/categoty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(@InjectRepository(Category) private categoryReponsitory: Repository<Category>) { }

    async findAllCategory(): Promise<Category[]> {
        return await this.categoryReponsitory.find();
    }
}
