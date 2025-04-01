import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBirthdateToGymnast1743516963500 implements MigrationInterface {
    name = 'AddBirthdateToGymnast1743516963500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gymnast" ADD "birthdate" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gymnast" DROP COLUMN "birthdate"`);
    }

}
