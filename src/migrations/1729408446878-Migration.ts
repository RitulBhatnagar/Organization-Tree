import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729408446878 implements MigrationInterface {
    name = 'Migration1729408446878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`inbox\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`inbox\` ADD UNIQUE INDEX \`IDX_1d56ca8c3c27225986941f032c\` (\`userId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_1d56ca8c3c27225986941f032c\` ON \`inbox\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`inbox\` ADD CONSTRAINT \`FK_1d56ca8c3c27225986941f032cc\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`inbox\` DROP FOREIGN KEY \`FK_1d56ca8c3c27225986941f032cc\``);
        await queryRunner.query(`DROP INDEX \`REL_1d56ca8c3c27225986941f032c\` ON \`inbox\``);
        await queryRunner.query(`ALTER TABLE \`inbox\` DROP INDEX \`IDX_1d56ca8c3c27225986941f032c\``);
        await queryRunner.query(`ALTER TABLE \`inbox\` DROP COLUMN \`userId\``);
    }

}
