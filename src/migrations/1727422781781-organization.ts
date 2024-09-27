import { MigrationInterface, QueryRunner } from "typeorm";

export class Organization1727422781781 implements MigrationInterface {
    name = 'Organization1727422781781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`organization\` (\`orgId\` varchar(36) NOT NULL, \`orgName\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9c8e76759bb851ff83c4d6ef41\` (\`orgName\`), PRIMARY KEY (\`orgId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`node\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`nodeid\` varchar(36) NOT NULL, \`nodename\` varchar(255) NOT NULL, \`nodetype\` enum ('organization', 'locations', 'employees', 'departments') NOT NULL, \`nodeColour\` varchar(255) NOT NULL, \`parentId\` varchar(255) NULL, \`orgId\` varchar(36) NULL, PRIMARY KEY (\`nodeid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`node\` ADD CONSTRAINT \`FK_ba001b660671bf4233abd7e7955\` FOREIGN KEY (\`parentId\`) REFERENCES \`node\`(\`nodeid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`node\` ADD CONSTRAINT \`FK_a16ae7e50107be420a0b15e853c\` FOREIGN KEY (\`orgId\`) REFERENCES \`organization\`(\`orgId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`node\` DROP FOREIGN KEY \`FK_a16ae7e50107be420a0b15e853c\``);
        await queryRunner.query(`ALTER TABLE \`node\` DROP FOREIGN KEY \`FK_ba001b660671bf4233abd7e7955\``);
        await queryRunner.query(`DROP TABLE \`node\``);
        await queryRunner.query(`DROP INDEX \`IDX_9c8e76759bb851ff83c4d6ef41\` ON \`organization\``);
        await queryRunner.query(`DROP TABLE \`organization\``);
    }

}
