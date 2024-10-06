import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Answer } from "./Answer";
import { Question } from "./Question";

@Entity({ name: "SubQuestions" })
export class SubQuestion {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  questionId?: string;

  @Column({ type: "text", nullable: false })
  content!: string;

  @Column({ type: "text", nullable: true })
  note!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  correctAnswer!: string;

  @Column({ type: "integer", nullable: false, default: 0 })
  order!: number;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @OneToMany(() => Answer, (answer) => answer.subQuestion)
  answers!: Answer[];

  @ManyToOne(() => Question, (question) => question.id, { onDelete: "CASCADE" })
  question!: Question;
}
