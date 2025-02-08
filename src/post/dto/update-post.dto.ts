import { IsNotEmpty } from "class-validator";
import { Category } from "src/category/entities/categoty.entity";

export class UpdatePostDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    thumbnail: string;

    status: number;

    @IsNotEmpty()
    category: Category
}