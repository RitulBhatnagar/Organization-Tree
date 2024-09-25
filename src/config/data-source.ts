import { DataSource } from "typeorm";
import { ENV } from "./env";
import { Node } from "../entities/node/nodeEntity";
import { Organization } from "../entities/organization/organizationEntity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: ENV.DB_HOST,
  port: parseInt(ENV.DB_PORT),
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [Node, Organization],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
  ssl: {
    rejectUnauthorized: false,
  },
});
