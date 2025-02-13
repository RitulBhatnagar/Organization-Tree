import { DataSource } from "typeorm";
import { ENV } from "./env";
import { Node } from "../entities/node/nodeEntity";
import { Organization } from "../entities/organization/organizationEntity";
import { Brand } from "../entities/Brand/brandEntity";
import { User } from "../entities/user/userEntity";
import { Role } from "../entities/Role/roleEntity";
import { Team } from "../entities/Team/teamEntity";
import { ContactPerson } from "../entities/ContactPerson/contactPersonEntity";
import { Task } from "../entities/Task/taskEntity";
import { TaskAnalytics } from "../entities/TaskAnalytics/taskAnaylticsEntity";
import { TaskAsset } from "../entities/TaskAsset/taskAssetEntity";
import { TaskHistory } from "../entities/TaskHistory/taskHistoryEntity";
import { Inbox } from "../entities/Inbox/inboxEntity";
import { Message } from "../entities/Messages/messageEntity";
import { Inventory } from "../entities/Inventory/inventoryEntity";
import { AssignedPerson } from "../entities/AssignedPerson/assignedPersonEntity";
import { Event } from "../entities/Event/eventEntity";
import { Comment } from "../entities/Commnets/commnetsEntity";
import { Collaborators } from "../entities/Collaborators/collaboratorsEntity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: ENV.DB_HOST,
  port: parseInt(ENV.DB_PORT),
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [
    Node,
    Organization,
    User,
    Role,
    Team,
    Brand,
    ContactPerson,
    Task,
    TaskAnalytics,
    TaskAsset,
    TaskHistory,
    Inbox,
    Comment,
    Message,
    Event,
    Inventory,
    AssignedPerson,
    Event,
    Inventory,
    Collaborators,
  ],
  migrations: [__dirname + "/../migrations/*.ts"],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
