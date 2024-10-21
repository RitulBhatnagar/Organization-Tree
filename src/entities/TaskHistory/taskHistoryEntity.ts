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
import { Task } from "../Task/taskEntity";
import { User } from "../user/userEntity";

@Entity()
export class TaskHistory extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  historyId!: string;

  @ManyToOne(() => Task, (task) => task.taskHistories)
  task!: Task;

  @ManyToOne(() => User, (user) => user.taskHistories)
  user!: User;

  @Column()
  action!: string;
}
