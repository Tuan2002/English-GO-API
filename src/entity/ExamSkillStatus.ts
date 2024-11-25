import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Exam } from "./Exam";
import { Skill } from "./Skill";

@Entity({ name: "ExamSkillStatuses" })
export class ExamSkillStatus {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  skillId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  startTime?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  endTime?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  status?: string;

  @Column({ type: "integer", nullable: false, default: 0 })
  order!: number;

  @Column({ type: "float", nullable: false, default: 0 })
  score!: number;

  @Column({ type: "integer", nullable: false, default: 1 })
  totalQuestion!: number;

  @ManyToOne(() => Exam, (exam) => exam.id, { onDelete: "CASCADE" })
  exam!: Exam;

  @ManyToOne(() => Skill, (skill) => skill.id, { onDelete: "CASCADE" })
  skill!: Skill;
}
