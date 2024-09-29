import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Level } from "./Level";
import { Category } from "./Category";
import { Question } from "./Question";

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

  @OneToMany(() => Level, (level) => level.skill)
  levels!: Level[];

  @OneToMany(() => Category, (category) => category.skill)
  categories!: Category[];

  @OneToMany(() => Question, (question) => question.skill)
  questions!: Question[];
}
