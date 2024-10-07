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
import { Role } from "../Role/roleEntity";
import { Team } from "../Team/teamEntity";
import { Brand } from "../Brand/brandEntity";

@Entity()
export class User extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 20, nullable: true })
  department!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 100 })
  password!: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles!: Role[];

  @ManyToMany(() => Team, (team) => team.members)
  @JoinTable()
  teamsMembers!: Team[];

  @OneToMany(() => Team, (team) => team.teamOwner)
  ownedTeams!: Team[];

  @ManyToMany(() => Brand, (brand) => brand.owners)
  @JoinTable()
  ownerBrands!: Brand[];

  @ManyToOne(() => User, (user) => user.subordinates)
  manager!: User;

  @OneToMany(() => User, (user) => user.manager)
  subordinates!: User[];
}
