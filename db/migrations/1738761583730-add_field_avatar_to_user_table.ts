import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldAvatarToUserTable1738761583730 implements MigrationInterface {
    name = 'AddFieldAvatarToUserTable1738761583730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`avatar\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`avatar\``);
    }

}
