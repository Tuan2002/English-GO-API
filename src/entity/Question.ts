import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Level } from "./Level";
import { Category } from "./Category";
import { Skill } from "./Skill";

@Entity({ name: "Questions" })
export class Question {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  skillId?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  levelId?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  categoryId?: string;

  @Column({ type: "text", nullable: false })
  questionContent!: string;

  @Column({ type: "text", nullable: true })
  questionNote!: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  questionImage!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  attachedFile?: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isActive!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @ManyToOne(() => Level, (level) => level.id, { onDelete: "CASCADE" })
  level!: Level;

  @ManyToOne(() => Category, (category) => category.id, { onDelete: "CASCADE" })
  category!: Category;

  @ManyToOne(() => Skill, (skill) => skill.id, { onDelete: "CASCADE" })
  skill!: Skill;
}
