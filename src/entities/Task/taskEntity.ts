import {
  Column,
  JoinTable,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { Brand } from "../Brand/brandEntity";
import { Comment } from "../Commnets/commnetsEntity";
import { AssignedPerson } from "../AssignedPerson/assignedPersonEntity";
import { TaskHistory } from "../TaskHistory/taskHistoryEntity";
import { Event } from "../Event/eventEntity";
import { Inventory } from "../Inventory/inventoryEntity";
import { User } from "../user/userEntity";
import { Collaborators } from "../Collaborators/collaboratorsEntity";
export enum TaskVisibilityEnum {
  ALL_TASKS = "ALL_TASKS",
  YOUR_TASKS = "YOUR_TASKS",
  TEAM_TASKS = "TEAM_TASKS",
  DELEGATED_TO_OTHERS = "DELEGATED_TO_OTHERS",
}

export enum TaskTypeEnum {
  GENERAL = "GENERAL",
  BRAND = "BRAND",
  EVENT = "EVENT",
  INVENTORY = "INVENTORY",
}

export enum CompletedStatusEnum {
  OPEN = "OPEN",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

@Entity()
export class Task extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  taskId!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({
    type: "enum",
    enum: TaskTypeEnum,
    default: TaskTypeEnum.GENERAL,
  })
  taskType!: TaskTypeEnum;

  @Column({
    type: "enum",
    enum: CompletedStatusEnum,
    default: CompletedStatusEnum.OPEN,
  })
  completedStatus!: CompletedStatusEnum;

  @Column({
    type: "enum",
    enum: TaskVisibilityEnum,
    default: TaskVisibilityEnum.ALL_TASKS,
  })
  visibility!: TaskVisibilityEnum;

  @Column({ type: "timestamp" })
  dueDate!: Date;

  @Column({ type: "timestamp", nullable: true })
  finishedDate?: Date;

  @ManyToOne(() => Brand, (brand) => brand.task, { nullable: true })
  relatedBrand!: Brand | null;

  @ManyToOne(() => Event, (event) => event.task, { nullable: true })
  relatedEvent!: Event | null;

  @ManyToOne(() => Inventory, (inventory) => inventory.task, { nullable: true })
  relatedInventory!: Inventory | null;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @ManyToOne(() => User, (user) => user.tasksCreated)
  creator!: User;

  @OneToMany(() => Collaborators, (collaborators) => collaborators.task)
  collaborators!: Collaborators[];

  @OneToMany(() => AssignedPerson, (assignedPerson) => assignedPerson.task)
  assignedPersons!: AssignedPerson[];

  @OneToMany(() => TaskHistory, (taskHistory) => taskHistory.task)
  taskHistories!: TaskHistory[];
}
