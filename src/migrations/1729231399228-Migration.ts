import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729231399228 implements MigrationInterface {
    name = 'Migration1729231399228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`relatedBrandBrandId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`relatedEventEventId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`relatedInventoryInventoryId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_5644ecd238b6d87cd214abe941c\` FOREIGN KEY (\`relatedBrandBrandId\`) REFERENCES \`brand\`(\`brandId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_ea6cd029f38c6386f9be987fcdf\` FOREIGN KEY (\`relatedEventEventId\`) REFERENCES \`event\`(\`eventId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_c0fedac63be26cd6e188f7b9819\` FOREIGN KEY (\`relatedInventoryInventoryId\`) REFERENCES \`inventory\`(\`inventoryId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_c0fedac63be26cd6e188f7b9819\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_ea6cd029f38c6386f9be987fcdf\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_5644ecd238b6d87cd214abe941c\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`relatedInventoryInventoryId\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`relatedEventEventId\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`relatedBrandBrandId\``);
    }

}
