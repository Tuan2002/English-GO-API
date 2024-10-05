import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Skill } from "./Skill";
import { Level } from "./Level";
import { Question } from "./Question";

@Entity({ name: "Categories" })
export class Category {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image?: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", nullable: true, default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  skillId?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  levelId?: string;

  @ManyToOne(() => Skill, (skill) => skill.id, { onDelete: "CASCADE" })
  skill!: Skill;

  @ManyToOne(() => Level, (level) => level.id, { onDelete: "CASCADE" })
  level!: Level;

  @OneToMany(() => Question, (question) => question.category)
  questions!: Question[];
}
