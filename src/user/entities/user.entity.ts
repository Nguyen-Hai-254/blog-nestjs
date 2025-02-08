import { Post } from 'src/post/entities/post.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true, default: null })
    refresh_token: string;

    @Column({ nullable: true, default: null })
    avatar: string;

    @Column({ default: 1 })
    status: number;

    @CreateDateColumn()
    create_at: Date;

    @UpdateDateColumn()
    update_at: Date;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[]
}