import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultValueOfTeamName1728281943700 implements MigrationInterface {
    name = 'DefaultValueOfTeamName1728281943700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team\` CHANGE \`teamName\` \`teamName\` varchar(100) NOT NULL DEFAULT 'team'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team\` CHANGE \`teamName\` \`teamName\` varchar(100) NOT NULL`);
    }

}
