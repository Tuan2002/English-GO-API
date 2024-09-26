import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "CvUploads" })
export class CvUpload {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  userId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  organization!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  proofImage?: string;

  @Column({ type: "date", nullable: false })
  startTime!: Date;

  @Column({ type: "date", nullable: false })
  endTime!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;
}
