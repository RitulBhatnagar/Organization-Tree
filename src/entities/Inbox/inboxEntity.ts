import {
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";
import { Message } from "../Messages/messageEntity";

@Entity()
export class Inbox extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  inboxId!: string;

  @OneToOne(() => User, (user) => user.inbox)
  @JoinColumn({ name: "userId" })
  user!: User;

  @OneToMany(() => Message, (message) => message.inbox)
  messages!: Message[];
}
