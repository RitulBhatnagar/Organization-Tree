import {
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";
import { Task } from "../Task/taskEntity";

@Entity()
export class Collaborators extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  collaboratorId!: string;

  @ManyToOne(() => User, (user) => user.collaborators)
  user!: User;

  @ManyToOne(() => Task, (task) => task.collaborators)
  task!: Task;
}
