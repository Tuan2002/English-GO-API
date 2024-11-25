import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { ExamQuestion } from "./ExamQuestion";

@Entity({ name: "ExamResultWritings" })
export class ExamResultWriting {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examQuestionId!: string;

  @Column({ type: "text", nullable: true, default: "" })
  data?: string;

  @Column({ type: "float", nullable: false, default: 0 })
  point?: number;

  @Column({ type: "text", nullable: true })
  feedback?: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isRated!: boolean;

  @ManyToOne(() => ExamQuestion, (examQuestion) => examQuestion.id, { onDelete: "CASCADE" })
  examQuestion!: ExamQuestion;
}
