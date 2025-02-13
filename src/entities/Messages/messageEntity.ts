import {
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";
import { Inbox } from "../Inbox/inboxEntity";

@Entity()
export class Message extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  messageId!: string;

  @Column()
  message!: string;

  @ManyToOne(() => Inbox, (inbox) => inbox.messages)
  inbox!: Inbox;

  @Column({ default: false })
  seen!: boolean;
}
