import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create_post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { FilterPostDto } from './dto/filter-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Post) private postRepository: Repository<Post>
    ) { }

    async createPost(userId: number, createPostDto: CreatePostDto): Promise<Post> {
        try {
            const user = await this.userRepository.findOneBy({ id: userId });
            const newPost = await this.postRepository.save({ ...createPostDto, user });

            return await this.postRepository.findOneBy({ id: newPost.id });
        } catch (e) {
            throw new HttpException(`Can not create post: + ${e}`, HttpStatus.BAD_REQUEST);
        }
    }

    async findAll(query: FilterPostDto): Promise<any> {
        try {
            const page = Number(query.page) || 1;
            const itemPerPage = Number(query.itemPerPage) || 10;
            const search = query.search || '';
            const categoryId = Number(query.category) || null;

            const [res, total] = await this.postRepository.findAndCount({
                where: [
                    { title: Like('%' + search + '%'), category: { id: categoryId } },
                    { description: Like('%' + search + '%'), category: { id: categoryId } },
                ],
                order: { create_at: 'DESC' },
                take: itemPerPage,
                skip: (page - 1) * itemPerPage,
                relations: {
                    user: true,
                    category: true
                },
                select: {
                    user: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                    category: { id: true, name: true, }
                }
            })

            const lastPage = Math.ceil(total / itemPerPage);
            const nextPage = page + 1 > lastPage ? null : page + 1;
            const prevPage = page - 1 < 1 ? null : page - 1;

            return {
                data: res,
                total,
                currentPage: page,
                nextPage, prevPage, lastPage
            }
        } catch (e) {
            throw new HttpException(`Can not get posts: + ${e}`, HttpStatus.BAD_REQUEST);
        }
    }

    async findPostById(idPost: number): Promise<Post> {
        try {
            const findPost = await this.postRepository.findOne({
                where: { id: idPost },
                relations: { user: true, category: true },
                select: {
                    user: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                    category: { id: true, name: true }
                }
            })

            return findPost
        } catch (e) {
            throw new HttpException(`Can not get post: + ${e}`, HttpStatus.BAD_REQUEST);
        }
    }

    async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<UpdateResult> {
        try {
            return await this.postRepository.update(id, updatePostDto);
        } catch (e) {
            throw new HttpException(`Can not update post: + ${e}`, HttpStatus.BAD_REQUEST);
        }

    }

    async deletePost(id: number): Promise<DeleteResult> {
        try {
            return await this.postRepository.delete(id);
        } catch (e) {
            throw new HttpException(`Can not delete post: + ${e}`, HttpStatus.BAD_REQUEST);
        }

    }
}
