import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Exam } from "./Exam";
import { ExamResultListening } from "./ExamResultListening";
import { ExamResultReading } from "./ExamResultReading";
import { ExamResultSpeaking } from "./ExamResultSpeaking";
import { ExamResultWriting } from "./ExamResultWriting";
import { GradeFeedback } from "./GradeFeedback";
import { Question } from "./Question";

@Entity({ name: "ExamQuestions" })
export class ExamQuestion {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  questionId!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  levelId?: string;

  @ManyToOne(() => Exam, (exam) => exam.id, { onDelete: "CASCADE" })
  exam!: Exam;

  @ManyToOne(() => Question, (question) => question.id, { onDelete: "CASCADE" })
  @JoinTable()
  question!: Question;

  @OneToMany(() => ExamResultWriting, (examResultWriting) => examResultWriting.examQuestion)
  examResultWritings!: ExamResultWriting[];

  @OneToMany(() => ExamResultListening, (examResultListening) => examResultListening.examQuestion)
  examResultListenings!: ExamResultListening[];

  @OneToMany(() => ExamResultSpeaking, (examResultSpeaking) => examResultSpeaking.examQuestion)
  examResultSpeakings!: ExamResultSpeaking[];

  @OneToMany(() => ExamResultReading, (examResultReading) => examResultReading.examQuestion)
  examResultReadings!: ExamResultReading[];

  @OneToMany(() => GradeFeedback, (gradeFeedback) => gradeFeedback.examQuestion)
  gradeFeedbacks!: GradeFeedback[];
}
