import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "CvCreateds" })
export class CvCreated {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  userId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  profession!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  position!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  appliedPosition!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  cvSample?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  facebook?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  fullName?: string;

  @Column({ type: "date", nullable: true })
  birthday?: Date;

  @Column({ type: "text", nullable: true })
  infomationPosition?: string;

  @Column({ type: "text", nullable: true })
  careerTarget?: string;

  @Column({ type: "text", nullable: true })
  referrer?: string[];

  @Column("simple-array", { nullable: true })
  educations?: string[];

  @Column("simple-array", { nullable: true })
  experiences?: string[];

  @Column("simple-array", { nullable: true })
  skills?: string[];

  @Column("simple-array", { nullable: true })
  activities?: string[];

  @Column("simple-array", { nullable: true })
  certificates?: string[];

  @Column("simple-array", { nullable: true })
  awards?: string[];

  @Column("simple-array", { nullable: true })
  products?: string[];

  @Column({ type: "varchar", length: 255, nullable: true })
  proofImage?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdDate!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedDate!: Date;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive!: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  isPublic!: boolean;
}
