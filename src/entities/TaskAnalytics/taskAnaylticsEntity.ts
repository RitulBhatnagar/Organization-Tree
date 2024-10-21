import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
@Entity()
export class TaskAnalytics extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: 0 })
  totalTasksCreated: number;

  @Column({ default: 0 })
  completedTasks: number;

  @Column({ default: 0 })
  openTasks: number;

  @Column({ default: 0 })
  overdueTasks: number;

  @Column({ default: 0 })
  generalServiceTasks: number;

  @Column({ default: 0 })
  brandRelatedTasks: number;

  @Column({ default: 0 })
  eventRelatedTasks: number;

  @Column({ default: 0 })
  inventoryRelatedTasks: number;
}
