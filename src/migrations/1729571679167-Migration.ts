import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729571679167 implements MigrationInterface {
    name = 'Migration1729571679167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_asset\` DROP FOREIGN KEY \`FK_1dd1df88ca7e835bcb95d2180da\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d56ca8c3c27225986941f032c\` ON \`inbox\``);
        await queryRunner.query(`ALTER TABLE \`task_asset\` CHANGE \`commnetCommentId\` \`commentCommentId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task_asset\` ADD CONSTRAINT \`FK_58188e8da9331253c5468b74895\` FOREIGN KEY (\`commentCommentId\`) REFERENCES \`comment\`(\`commentId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_asset\` DROP FOREIGN KEY \`FK_58188e8da9331253c5468b74895\``);
        await queryRunner.query(`ALTER TABLE \`task_asset\` CHANGE \`commentCommentId\` \`commnetCommentId\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_1d56ca8c3c27225986941f032c\` ON \`inbox\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`task_asset\` ADD CONSTRAINT \`FK_1dd1df88ca7e835bcb95d2180da\` FOREIGN KEY (\`commnetCommentId\`) REFERENCES \`comment\`(\`commentId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
