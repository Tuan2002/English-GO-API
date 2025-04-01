import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { ExamQuestion } from "./ExamQuestion";

@Entity({ name: "GradeFeedbacks" })
export class GradeFeedback {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examQuestionId!: string;

  @Column({ type: "varchar", nullable: false, length: 255 })
  score: string;

  @Column({ type: "varchar", nullable: false, length: 255 })
  type: string;

  @Column({ type: "text", nullable: true })
  feedback?: string;

  @ManyToOne(() => ExamQuestion, (examQuestion) => examQuestion.id, { onDelete: "CASCADE" })
  examQuestion!: ExamQuestion;
}
