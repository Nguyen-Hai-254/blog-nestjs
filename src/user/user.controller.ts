import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { extname } from 'path';

@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @UseGuards(AuthGuard)
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'itemsPerPage', required: false, example: 10 })
    @ApiQuery({ name: 'search', required: false, example: 'abc@gmail.com' })
    @Get()
    findAll(@Query() query: FilterUserDto): Promise<User[]> {
        return this.userService.findAll(query);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(Number(id));
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(Number(id), updateUserDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(Number(id));
    }

    @UseGuards(AuthGuard)
    @Post('upload-avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: storageConfig('avatar'),
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
    uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }

        if (!req.file) {
            throw new BadRequestException('File is required!');
        }

        return this.userService.updateAvatar(req.user_data.id, file.destination + '/' + file.filename)
    }


}
