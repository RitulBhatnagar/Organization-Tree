import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskManagement1728969569153 implements MigrationInterface {
    name = 'TaskManagement1728969569153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`assigned_person\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`assignedPersonId\` varchar(36) NOT NULL, \`userUserId\` varchar(36) NULL, \`taskTaskId\` varchar(36) NULL, PRIMARY KEY (\`assignedPersonId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_history\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`historyId\` varchar(36) NOT NULL, \`action\` varchar(255) NOT NULL, \`taskTaskId\` varchar(36) NULL, \`userUserId\` varchar(36) NULL, PRIMARY KEY (\`historyId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`eventId\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`inventory\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`eventId\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`taskId\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`taskType\` enum ('GENERAL', 'BRAND', 'EVENT', 'INVENTORY') NOT NULL DEFAULT 'GENERAL', \`completedStatus\` enum ('OPEN', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'OPEN', \`visibility\` enum ('ALL_TASKS', 'YOUR_TASKS', 'TEAM_TASKS', 'DELEGATED_TO_OTHERS') NOT NULL DEFAULT 'ALL_TASKS', \`dueDate\` timestamp NOT NULL, PRIMARY KEY (\`taskId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_asset\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`taskAssetId\` varchar(36) NOT NULL, \`fileType\` enum ('AUDIO', 'IMAGE', 'DOCUMENT') NOT NULL, \`fileLocation\` varchar(255) NOT NULL, \`commnetCommentId\` varchar(36) NULL, PRIMARY KEY (\`taskAssetId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`commentId\` varchar(36) NOT NULL, \`message\` varchar(255) NOT NULL, \`userUserId\` varchar(36) NULL, \`taskTaskId\` varchar(36) NULL, PRIMARY KEY (\`commentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`message\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`messageId\` varchar(36) NOT NULL, \`message\` varchar(255) NOT NULL, \`seen\` tinyint NOT NULL DEFAULT 0, \`inboxInboxId\` varchar(36) NULL, PRIMARY KEY (\`messageId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`inbox\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`inboxId\` varchar(36) NOT NULL, PRIMARY KEY (\`inboxId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_analytics\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp NULL, \`id\` varchar(36) NOT NULL, \`totalTasksCreated\` int NOT NULL DEFAULT '0', \`completedTasks\` int NOT NULL DEFAULT '0', \`openTasks\` int NOT NULL DEFAULT '0', \`overdueTasks\` int NOT NULL DEFAULT '0', \`generalServiceTasks\` int NOT NULL DEFAULT '0', \`brandRelatedTasks\` int NOT NULL DEFAULT '0', \`eventRelatedTasks\` int NOT NULL DEFAULT '0', \`inventoryRelatedTasks\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`assigned_person\` ADD CONSTRAINT \`FK_541ca290a573f2dc8b0f3675b74\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`assigned_person\` ADD CONSTRAINT \`FK_22a52a6ede8a4348bdb9cf389e7\` FOREIGN KEY (\`taskTaskId\`) REFERENCES \`task\`(\`taskId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_history\` ADD CONSTRAINT \`FK_dfc71fefb9691ee242124bd0602\` FOREIGN KEY (\`taskTaskId\`) REFERENCES \`task\`(\`taskId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_history\` ADD CONSTRAINT \`FK_c93839f3b7c5652adbe94586fe0\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_asset\` ADD CONSTRAINT \`FK_1dd1df88ca7e835bcb95d2180da\` FOREIGN KEY (\`commnetCommentId\`) REFERENCES \`comment\`(\`commentId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_1a0a9c69d17cfb196d090858bc8\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_dc8cb2f0561bc6f09902a1dc88d\` FOREIGN KEY (\`taskTaskId\`) REFERENCES \`task\`(\`taskId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_05ca9f7dccbf971ee2fb36da7f0\` FOREIGN KEY (\`inboxInboxId\`) REFERENCES \`inbox\`(\`inboxId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_05ca9f7dccbf971ee2fb36da7f0\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_dc8cb2f0561bc6f09902a1dc88d\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_1a0a9c69d17cfb196d090858bc8\``);
        await queryRunner.query(`ALTER TABLE \`task_asset\` DROP FOREIGN KEY \`FK_1dd1df88ca7e835bcb95d2180da\``);
        await queryRunner.query(`ALTER TABLE \`task_history\` DROP FOREIGN KEY \`FK_c93839f3b7c5652adbe94586fe0\``);
        await queryRunner.query(`ALTER TABLE \`task_history\` DROP FOREIGN KEY \`FK_dfc71fefb9691ee242124bd0602\``);
        await queryRunner.query(`ALTER TABLE \`assigned_person\` DROP FOREIGN KEY \`FK_22a52a6ede8a4348bdb9cf389e7\``);
        await queryRunner.query(`ALTER TABLE \`assigned_person\` DROP FOREIGN KEY \`FK_541ca290a573f2dc8b0f3675b74\``);
        await queryRunner.query(`DROP TABLE \`task_analytics\``);
        await queryRunner.query(`DROP TABLE \`inbox\``);
        await queryRunner.query(`DROP TABLE \`message\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
        await queryRunner.query(`DROP TABLE \`task_asset\``);
        await queryRunner.query(`DROP TABLE \`task\``);
        await queryRunner.query(`DROP TABLE \`inventory\``);
        await queryRunner.query(`DROP TABLE \`event\``);
        await queryRunner.query(`DROP TABLE \`task_history\``);
        await queryRunner.query(`DROP TABLE \`assigned_person\``);
    }

}
