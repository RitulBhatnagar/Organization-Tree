import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamNameDescriptionColumn1728276866544 implements MigrationInterface {
    name = 'TeamNameDescriptionColumn1728276866544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team\` ADD \`teamName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`team\` ADD \`teamDescription\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team\` DROP COLUMN \`teamDescription\``);
        await queryRunner.query(`ALTER TABLE \`team\` DROP COLUMN \`teamName\``);
    }

}
