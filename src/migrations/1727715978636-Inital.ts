import { MigrationInterface, QueryRunner } from "typeorm";

export class Inital1727715978636 implements MigrationInterface {
    name = 'Inital1727715978636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`organization\` (\`orgId\` varchar(36) NOT NULL, \`orgName\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_9c8e76759bb851ff83c4d6ef41\` (\`orgName\`), PRIMARY KEY (\`orgId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`node\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`nodeid\` varchar(36) NOT NULL, \`nodename\` varchar(255) NOT NULL, \`nodetype\` enum ('organization', 'locations', 'employees', 'departments') NOT NULL, \`nodeColour\` varchar(255) NOT NULL, \`parentId\` varchar(255) NULL, \`orgId\` varchar(36) NULL, PRIMARY KEY (\`nodeid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`roleId\` varchar(36) NOT NULL, \`roleName\` enum ('ADMIN', 'PO', 'BO', 'TO', 'PO+TO') NOT NULL, PRIMARY KEY (\`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`team\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`teamId\` varchar(36) NOT NULL, \`teamOwnerUserId\` varchar(36) NULL, PRIMARY KEY (\`teamId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`userId\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`department\` varchar(20) NULL, \`email\` varchar(100) NOT NULL, \`managerUserId\` varchar(36) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contact_person\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`contactId\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`phone\` varchar(20) NOT NULL, \`email\` varchar(100) NULL, \`brandBrandId\` varchar(36) NULL, PRIMARY KEY (\`contactId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`brand\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`brandId\` varchar(36) NOT NULL, \`brandName\` varchar(255) NOT NULL, \`revenue\` decimal(15,2) NULL, \`dealCloseValue\` decimal(15,2) NULL, PRIMARY KEY (\`brandId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles_role\` (\`userUserId\` varchar(36) NOT NULL, \`roleRoleId\` varchar(36) NOT NULL, INDEX \`IDX_0bd606ba8531dd93b457b8486d\` (\`userUserId\`), INDEX \`IDX_56f8ede2f2e059d4db74591c53\` (\`roleRoleId\`), PRIMARY KEY (\`userUserId\`, \`roleRoleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_teams_members_team\` (\`userUserId\` varchar(36) NOT NULL, \`teamTeamId\` varchar(36) NOT NULL, INDEX \`IDX_7b91feea32888239730bd966be\` (\`userUserId\`), INDEX \`IDX_23b99121ddec0492562bd4e746\` (\`teamTeamId\`), PRIMARY KEY (\`userUserId\`, \`teamTeamId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_owner_brands_brand\` (\`userUserId\` varchar(36) NOT NULL, \`brandBrandId\` varchar(36) NOT NULL, INDEX \`IDX_fb8a75ce20793c100606749bd4\` (\`userUserId\`), INDEX \`IDX_7f98393c24895fc275ce96ddb0\` (\`brandBrandId\`), PRIMARY KEY (\`userUserId\`, \`brandBrandId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`node\` ADD CONSTRAINT \`FK_ba001b660671bf4233abd7e7955\` FOREIGN KEY (\`parentId\`) REFERENCES \`node\`(\`nodeid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`node\` ADD CONSTRAINT \`FK_a16ae7e50107be420a0b15e853c\` FOREIGN KEY (\`orgId\`) REFERENCES \`organization\`(\`orgId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team\` ADD CONSTRAINT \`FK_35b3a1a054f7ad550354eeb0a12\` FOREIGN KEY (\`teamOwnerUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_ec4652da87d8fcd6745897b1eeb\` FOREIGN KEY (\`managerUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact_person\` ADD CONSTRAINT \`FK_dc1bccbf61c0a76950dcb83df69\` FOREIGN KEY (\`brandBrandId\`) REFERENCES \`brand\`(\`brandId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_0bd606ba8531dd93b457b8486d9\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_56f8ede2f2e059d4db74591c533\` FOREIGN KEY (\`roleRoleId\`) REFERENCES \`role\`(\`roleId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_teams_members_team\` ADD CONSTRAINT \`FK_7b91feea32888239730bd966be1\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_teams_members_team\` ADD CONSTRAINT \`FK_23b99121ddec0492562bd4e7461\` FOREIGN KEY (\`teamTeamId\`) REFERENCES \`team\`(\`teamId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_owner_brands_brand\` ADD CONSTRAINT \`FK_fb8a75ce20793c100606749bd42\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_owner_brands_brand\` ADD CONSTRAINT \`FK_7f98393c24895fc275ce96ddb0f\` FOREIGN KEY (\`brandBrandId\`) REFERENCES \`brand\`(\`brandId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_owner_brands_brand\` DROP FOREIGN KEY \`FK_7f98393c24895fc275ce96ddb0f\``);
        await queryRunner.query(`ALTER TABLE \`user_owner_brands_brand\` DROP FOREIGN KEY \`FK_fb8a75ce20793c100606749bd42\``);
        await queryRunner.query(`ALTER TABLE \`user_teams_members_team\` DROP FOREIGN KEY \`FK_23b99121ddec0492562bd4e7461\``);
        await queryRunner.query(`ALTER TABLE \`user_teams_members_team\` DROP FOREIGN KEY \`FK_7b91feea32888239730bd966be1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_56f8ede2f2e059d4db74591c533\``);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_0bd606ba8531dd93b457b8486d9\``);
        await queryRunner.query(`ALTER TABLE \`contact_person\` DROP FOREIGN KEY \`FK_dc1bccbf61c0a76950dcb83df69\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_ec4652da87d8fcd6745897b1eeb\``);
        await queryRunner.query(`ALTER TABLE \`team\` DROP FOREIGN KEY \`FK_35b3a1a054f7ad550354eeb0a12\``);
        await queryRunner.query(`ALTER TABLE \`node\` DROP FOREIGN KEY \`FK_a16ae7e50107be420a0b15e853c\``);
        await queryRunner.query(`ALTER TABLE \`node\` DROP FOREIGN KEY \`FK_ba001b660671bf4233abd7e7955\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f98393c24895fc275ce96ddb0\` ON \`user_owner_brands_brand\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb8a75ce20793c100606749bd4\` ON \`user_owner_brands_brand\``);
        await queryRunner.query(`DROP TABLE \`user_owner_brands_brand\``);
        await queryRunner.query(`DROP INDEX \`IDX_23b99121ddec0492562bd4e746\` ON \`user_teams_members_team\``);
        await queryRunner.query(`DROP INDEX \`IDX_7b91feea32888239730bd966be\` ON \`user_teams_members_team\``);
        await queryRunner.query(`DROP TABLE \`user_teams_members_team\``);
        await queryRunner.query(`DROP INDEX \`IDX_56f8ede2f2e059d4db74591c53\` ON \`user_roles_role\``);
        await queryRunner.query(`DROP INDEX \`IDX_0bd606ba8531dd93b457b8486d\` ON \`user_roles_role\``);
        await queryRunner.query(`DROP TABLE \`user_roles_role\``);
        await queryRunner.query(`DROP TABLE \`brand\``);
        await queryRunner.query(`DROP TABLE \`contact_person\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`team\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`node\``);
        await queryRunner.query(`DROP INDEX \`IDX_9c8e76759bb851ff83c4d6ef41\` ON \`organization\``);
        await queryRunner.query(`DROP TABLE \`organization\``);
    }

}
