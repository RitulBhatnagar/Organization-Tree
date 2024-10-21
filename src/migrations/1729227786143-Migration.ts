import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729227786143 implements MigrationInterface {
    name = 'Migration1729227786143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`inventory\` CHANGE \`eventId\` \`inventoryId\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`finishedDate\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`role\` CHANGE \`roleName\` \`roleName\` enum ('ADMIN', 'PO', 'BO', 'MO', 'TO', 'PO+TO') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role\` CHANGE \`roleName\` \`roleName\` enum ('ADMIN', 'PO', 'BO', 'TO', 'PO+TO') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`finishedDate\``);
        await queryRunner.query(`ALTER TABLE \`inventory\` CHANGE \`inventoryId\` \`eventId\` varchar(36) NOT NULL`);
    }

}
