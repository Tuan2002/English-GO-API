import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Skill } from "./Skill";
import { Category } from "./Category";
import { Question } from "./Question";

@Entity({ name: "Levels" })
export class Level {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  skillId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  displayName!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image?: string;

  @Column({ type: "integer", nullable: false, default: 0 })
  subQuestionNumber!: number;

  @ManyToOne(() => Skill, (skill) => skill.id, { onDelete: "CASCADE" })
  skill!: Skill;

  @OneToMany(() => Category, (category) => category.level)
  categories!: Category[];

  @OneToMany(() => Question, (question) => question.level)
  questions!: Question[];
}
