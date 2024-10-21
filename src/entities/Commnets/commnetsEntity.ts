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
import { TaskAsset } from "../TaskAsset/taskAssetEntity";

@Entity()
export class Comment extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  commentId!: string;

  @Column()
  message!: string;

  @ManyToOne(() => User, (user) => user.comments)
  user!: User;

  @OneToMany(() => TaskAsset, (taskAsset) => taskAsset.commnet)
  @JoinTable()
  taskAssets!: TaskAsset[];

  @ManyToOne(() => Task, (task) => task.comments)
  task!: Task;
}
