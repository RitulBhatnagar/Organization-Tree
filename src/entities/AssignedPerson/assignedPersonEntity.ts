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
export class AssignedPerson extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  assignedPersonId!: string;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  user!: User;

  @ManyToOne(() => Task, (task) => task.assignedPersons)
  task!: Task;
}
