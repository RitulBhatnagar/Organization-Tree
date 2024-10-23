// src/entities/Node.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { Organization } from "../organization/organizationEntity"; // Import the Organization entity

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

  @ManyToOne(() => Node, (node) => node.nodeid)
  @JoinColumn({ name: "parentId" })
  parent?: Node;

  @ManyToOne(() => Organization, (organization) => organization.nodes, {
    nullable: true,
  })
  @JoinColumn({ name: "orgId" })
  organization?: Organization;
}
