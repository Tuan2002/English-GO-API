import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Exam } from "./Exam";
import { Question } from "./Question";

@Entity({ name: "ExamQuestions" })
export class ExamQuestion {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  questionId!: string;

  @ManyToOne(() => Exam, (exam) => exam.id, { onDelete: "CASCADE" })
  exam!: Exam;

  @ManyToOne(() => Question, (question) => question.id, { onDelete: "CASCADE" })
  question!: Question;
}
