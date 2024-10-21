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
import { Task } from "../Task/taskEntity";
import { Comment } from "../Commnets/commnetsEntity";

export enum FileTypeEnum {
  AUDIO = "AUDIO",
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
}

@Entity()
export class TaskAsset extends BaseModel {
  @PrimaryGeneratedColumn("uuid")
  taskAssetId!: string;

  @Column({
    type: "enum",
    enum: FileTypeEnum,
  })
  fileType!: FileTypeEnum;

  @Column()
  fileLocation!: string;

  @ManyToOne(() => Comment, (commnet) => commnet.taskAssets)
  commnet!: Comment;
}
