import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { SubQuestion } from "./SubQuestion";

@Entity({ name: "Answers" })
export class Answer {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  subQuestionId?: string;

  @Column({ type: "text", nullable: false })
  answerContent!: string;

  @Column({ type: "integer", nullable: false, default: 0 })
  order!: number;

  @Column({ type: "boolean", nullable: false, default: false })
  isCorrect!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @ManyToOne(() => SubQuestion, (SubQuestion) => SubQuestion.id, { onDelete: "CASCADE" })
  subQuestion!: SubQuestion;
}
