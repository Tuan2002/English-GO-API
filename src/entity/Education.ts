import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Educations" })
export class Education {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  userId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  school!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  specialzed!: string;

  @Column({ type: "date", nullable: false })
  startTime!: Date;

  @Column({ type: "date", nullable: false })
  endTime!: Date;

  @Column({ type: "boolean", nullable: false })
  isWorking!: boolean;

  @Column({ type: "text", nullable: true })
  description?: string;
}
