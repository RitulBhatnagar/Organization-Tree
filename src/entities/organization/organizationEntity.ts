// src/entities/Organization.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Node } from "../node/nodeEntity"; // Adjust the import path as per your structure

@Entity()
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  orgId!: string;

  @Column({ type: "varchar", unique: true })
  orgName!: string;

  @OneToMany(() => Node, (node) => node.organization)
  nodes!: Node[];
}
