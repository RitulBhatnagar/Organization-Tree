import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729403407992 implements MigrationInterface {
    name = 'Migration1729403407992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`creatorUserId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_cc6fdd3fe4f9cc5358818629bf6\` FOREIGN KEY (\`creatorUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_cc6fdd3fe4f9cc5358818629bf6\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`creatorUserId\``);
    }

}
