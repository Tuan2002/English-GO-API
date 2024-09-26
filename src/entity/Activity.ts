import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Activities" })
export class Activity {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  userId!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  organization!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  position!: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  proofImage?: string;

  @Column({ type: "date", nullable: false })
  startTime!: Date;

  @Column({ type: "date", nullable: true })
  endTime?: Date;

  @Column({ type: "boolean", nullable: false })
  isActive!: boolean;

  @Column({ type: "text", nullable: true })
  description?: string;
}
