import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";

@Entity()
export class Team extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  teamId!: string;

  @Column({ length: 100, default: "team" })
  teamName!: string;

  @Column({ length: 100, nullable: true })
  teamDescription!: string;

  @ManyToOne(() => User, (user) => user.ownedTeams)
  teamOwner!: User;

  @ManyToMany(() => User, (user) => user.teamsMembers)
  members!: User[];
}
