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
import { Role } from "../Role/roleEntity";
import { Team } from "../Team/teamEntity";
import { Brand } from "../Brand/brandEntity";
import { Comment } from "../Commnets/commnetsEntity";
import { AssignedPerson } from "../AssignedPerson/assignedPersonEntity";
import { TaskHistory } from "../TaskHistory/taskHistoryEntity";
import { Inbox } from "../Inbox/inboxEntity";
import { Task } from "../Task/taskEntity";
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

  @OneToMany(() => Comment, (comment) => comment.user)
  @JoinTable()
  comments!: Comment[];

  @OneToMany(() => AssignedPerson, (assignedPerson) => assignedPerson.user)
  @JoinTable()
  assignedTasks!: AssignedPerson[];

  @OneToMany(() => TaskHistory, (taskHistory) => taskHistory.user)
  @JoinTable()
  taskHistories!: TaskHistory[];

  @OneToMany(() => Task, (task) => task.creator)
  @JoinTable()
  tasksCreated!: Task[];

  @OneToOne(() => Inbox, (inbox) => inbox.user, { cascade: true })
  inbox: Inbox;
}
