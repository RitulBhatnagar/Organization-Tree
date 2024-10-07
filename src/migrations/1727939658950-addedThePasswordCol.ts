import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedThePasswordCol1727939658950 implements MigrationInterface {
    name = 'AddedThePasswordCol1727939658950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
    }

}
