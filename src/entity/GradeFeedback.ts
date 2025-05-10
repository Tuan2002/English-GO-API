import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { ExamQuestion } from "./ExamQuestion";
import { RegisterGradeExam } from "./RegisterGradeExam";

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

  @Column({ type: "varchar", length: 255, nullable: true })
  registerGradeExamId!: string;

  @ManyToOne(() => ExamQuestion, (examQuestion) => examQuestion.id, { onDelete: "CASCADE" })
  examQuestion!: ExamQuestion;

  @OneToOne(() => RegisterGradeExam, (registerGradeExam) => registerGradeExam.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "registerGradeExamId" })
  registerGradeExam!: RegisterGradeExam | null;
}
