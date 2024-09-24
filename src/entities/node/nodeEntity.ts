import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";

export enum NodeType {
  ORGANIZATION = "organization",
  LOCATION = "locations",
  EMPLOYEE = "employees",
  DEPARTMENTS = "departments",
}

@Entity()
export class Node extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  nodeid!: string;

  @Column({ type: "varchar" })
  nodename!: string;

  @Column({ type: "enum", enum: NodeType })
  nodetype!: NodeType;

  @Column({ type: "varchar" })
  nodeColour!: string;

  @Column({ type: "uuid", nullable: true })
  parentId!: string | null;

  // Optional relations if you plan on defining them later
  @ManyToOne(() => Node, (node) => node.nodeid)
  @JoinColumn({ name: "parentId" })
  parent?: Node;
}
