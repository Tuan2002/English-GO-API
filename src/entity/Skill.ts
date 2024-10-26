import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Level } from "./Level";
import { Category } from "./Category";
import { Question } from "./Question";
import { ExamSkillStatus } from "./ExamSkillStatus";

@Entity({ name: "Skills" })
export class Skill {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  displayName!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image?: string;

  @Column({ type: "integer", nullable: false, default: 0 })
  order!: number;

  @Column({ type: "integer", nullable: false, default: 0 })
  expiredTime!: number;

  @OneToMany(() => Level, (level) => level.skill)
  levels!: Level[];

  @OneToMany(() => Category, (category) => category.skill)
  categories!: Category[];

  @OneToMany(() => Question, (question) => question.skill)
  questions!: Question[];

  @OneToMany(() => ExamSkillStatus, (examSkillStatus) => examSkillStatus.skill)
  examSkillStatuses!: ExamSkillStatus[];
}
