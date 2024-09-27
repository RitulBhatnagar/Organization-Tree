import { MigrationInterface, QueryRunner } from "typeorm";

export class Organization21727423082556 implements MigrationInterface {
    name = 'Organization21727423082556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organization\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organization\` DROP COLUMN \`isActive\``);
    }

}
