import { Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";

@Entity()
export class Team extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  teamId!: string;

  @ManyToOne(() => User, (user) => user.ownedTeams)
  teamOwner!: User;

  @ManyToMany(() => User, (user) => user.teamsMembers)
  members!: User[];
}
