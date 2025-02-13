import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { User } from "../user/userEntity";
import { ContactPerson } from "../ContactPerson/contactPersonEntity";
import { Task } from "../Task/taskEntity";

@Entity()
export class Brand extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  brandId!: string;

  @Column()
  brandName!: string;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  revenue!: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  dealCloseValue!: number;

  @ManyToMany(() => User, (user) => user.ownerBrands)
  owners!: User[];

  @OneToMany(() => ContactPerson, (contactPerson) => contactPerson.brand)
  contactPersons!: ContactPerson[];

  @OneToMany(() => Task, (task) => task.relatedBrand)
  task?: Task[];
}
