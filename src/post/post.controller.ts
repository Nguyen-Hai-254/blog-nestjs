import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create_post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { PostService } from './post.service';
import { FilterPostDto } from './dto/filter-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiBearerAuth()
@Controller('post')
export class PostController {
    constructor(private postService: PostService) { }

    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @Post()
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage: storageConfig('thumbnail'),
        fileFilter: (req, file, cb) => {
            const ext = extname(file.originalname);
            const allowedExtArr = ['.jpg', '.png', '.jpeg']
            if (!allowedExtArr.includes(ext)) {
                req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`
                cb(null, false);
            } else {
                const fileSize = parseInt(req.headers['content-length'])
                if (fileSize > 5 * 1024 * 1024) {
                    req.fileValidationError = 'File size is too large. Accepted file size is less than 5 MB';
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            }
        }
    }))
    createPost(@Req() req: any, @Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File) {
        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }

        if (!req.file) {
            throw new BadRequestException('File is required!');
        }

        return this.postService.createPost(req.user_data.id, { ...createPostDto, thumbnail: file.destination + '/' + file.filename });
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll(@Query() query: FilterPostDto): Promise<any> {
        return this.postService.findAll(query);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findPostById(@Param('id') id: string): Promise<PostEntity> {
        return this.postService.findPostById(Number(id));
    }

    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @Put(':id')
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage: storageConfig('thumbnail'),
        fileFilter: (req, file, cb) => {
            const ext = extname(file.originalname);
            const allowedExtArr = ['.jpg', '.png', '.jpeg']
            if (!allowedExtArr.includes(ext)) {
                req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`
                cb(null, false);
            } else {
                const fileSize = parseInt(req.headers['content-length'])
                if (fileSize > 5 * 1024 * 1024) {
                    req.fileValidationError = 'File size is too large. Accepted file size is less than 5 MB';
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            }
        }
    }))
    updatePost(@Param('id') id: string, @Req() req: any, @Body() updatePostDto: UpdatePostDto, @UploadedFile() file: Express.Multer.File) {
        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }

        if (!req.file) {
            throw new BadRequestException('File is required!');
        }

        return this.postService.updatePost(Number(id), { ...updatePostDto, thumbnail: file.destination + '/' + file.filename });
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    deletePost(@Param('id') id: string) {
        return this.postService.deletePost(Number(id));
    }
}
