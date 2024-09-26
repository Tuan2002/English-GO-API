import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "SkillLevels" })
export class SkillLevel {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  level!: string;

  @Column({ type: "text", nullable: true })
  description?: string;
}
