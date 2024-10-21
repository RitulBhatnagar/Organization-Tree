import { Entity, Column, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/userEntity";
import { BaseModel } from "../../utils/baseEntity/baseModel";
export enum UserRole {
  ADMIN = "ADMIN",
  PO = "PO",
  BO = "BO",
  MO = "MO",
  TO = "TO",
  PO_TO = "PO+TO",
}
@Entity()
export class Role extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  roleId!: string;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  roleName!: UserRole;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}
