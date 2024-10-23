import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../../utils/baseEntity/baseModel";
import { Brand } from "../Brand/brandEntity";

@Entity()
export class ContactPerson extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  contactId!: string;

  @Column({ length: 100, nullable: false })
  name!: string;

  @Column({ length: 20, nullable: false })
  phone!: string;

  @Column({ length: 100, nullable: true })
  email!: string;

  @ManyToOne(() => Brand, (brand) => brand.contactPersons)
  brand!: Brand;
}
