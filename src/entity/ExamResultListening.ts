import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { ExamQuestion } from "./ExamQuestion";
import { SubQuestion } from "./SubQuestion";
import { Answer } from "./Answer";

@Entity({ name: "ExamResultListenings" })
export class ExamResultListening {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examQuestionId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  subQuestionId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  answerId!: string;

  @ManyToOne(() => ExamQuestion, (examQuestion) => examQuestion.id, { onDelete: "CASCADE" })
  examQuestion!: ExamQuestion;

  @ManyToOne(() => SubQuestion, (subQuestion) => subQuestion.id, { onDelete: "CASCADE" })
  subQuestion!: SubQuestion;

  @ManyToOne(() => Answer, (answer) => answer.id, { onDelete: "CASCADE" })
  answer!: Answer;
}
