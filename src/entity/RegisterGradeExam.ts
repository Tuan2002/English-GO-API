import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Exam } from "./Exam";
import { GradeFeedback } from "./GradeFeedback";
import { User } from "./User";

@Entity({ name: "RegisterGradeExams" })
export class RegisterGradeExam {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  skillId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examinerId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  contestantId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  status!: string;

  @ManyToOne(() => Exam, (exam) => exam.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "examId" })
  exam!: Exam;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "examinerId" })
  examiner!: User;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contestantId" })
  contestant!: User;

  @OneToOne(() => GradeFeedback, (gradeFeedback) => gradeFeedback.registerGradeExam)
  gradeFeedback: GradeFeedback;
}
