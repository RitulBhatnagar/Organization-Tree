import { DataSource } from "typeorm";
import { ENV } from "./env";
import { Node } from "../entities/node/nodeEntity";
import { Organization } from "../entities/organization/organizationEntity";
import { Brand } from "../entities/Brand/brandEntity";
import { User } from "../entities/user/userEntity";
import { Role } from "../entities/Role/roleEntity";
import { Team } from "../entities/Team/teamEntity";
import { ContactPerson } from "../entities/ContactPerson/contactPersonEntity";
import { MinimalUser } from "../entities/Minimal/minimalUserEntity";

console.log(ENV.DB_DATABASE);
export const AppDataSource = new DataSource({
  type: "mysql",
  host: ENV.DB_HOST,
  port: parseInt(ENV.DB_PORT),
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [Node, Organization, User, Role, Team, Brand, ContactPerson],
  migrations: [__dirname + "/../migrations/*.ts"],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
