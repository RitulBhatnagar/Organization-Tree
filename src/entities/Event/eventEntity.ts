import {
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { Task } from "../Task/taskEntity";

@Entity()
export class Event extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  eventId: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => Task, (task) => task.relatedEvent)
  task?: Task[];
}
