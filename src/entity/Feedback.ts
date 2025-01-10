import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ExamSchedule } from "./ExamSchedule";

@Entity({ name: "Feedbacks" })
export class Feedback {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  fullName!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  phoneNumber!: string;

  @Column({ type: "text", nullable: true })
  feedback?: string;

  @Column({})
  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
