import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { Task } from "../Task/taskEntity";

@Entity()
export class Inventory extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  inventoryId!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => Task, (task) => task.relatedInventory)
  task?: Task[];
}
