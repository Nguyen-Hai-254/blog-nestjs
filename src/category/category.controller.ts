import { Controller, Get } from '@nestjs/common';
import { Category } from './entities/categoty.entity';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @Get()
    findAllCategory(): Promise<Category[]> {
        return this.categoryService.findAllCategory();
    }
}
