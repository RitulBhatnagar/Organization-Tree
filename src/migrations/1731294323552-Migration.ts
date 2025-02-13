import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1731294323552 implements MigrationInterface {
    name = 'Migration1731294323552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`collaborators\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`collaboratorId\` varchar(36) NOT NULL, \`userUserId\` varchar(36) NULL, \`taskTaskId\` varchar(36) NULL, PRIMARY KEY (\`collaboratorId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`collaborators\` ADD CONSTRAINT \`FK_d1a85af50dd124aff7135d70f76\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collaborators\` ADD CONSTRAINT \`FK_eeb37d91c3defb3d91ef57a4ec0\` FOREIGN KEY (\`taskTaskId\`) REFERENCES \`task\`(\`taskId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collaborators\` DROP FOREIGN KEY \`FK_eeb37d91c3defb3d91ef57a4ec0\``);
        await queryRunner.query(`ALTER TABLE \`collaborators\` DROP FOREIGN KEY \`FK_d1a85af50dd124aff7135d70f76\``);
        await queryRunner.query(`DROP TABLE \`collaborators\``);
    }

}
