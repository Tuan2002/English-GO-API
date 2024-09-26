import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { GroupRole } from "./GroupRole";
import { Province } from "./Province";
import { User } from "./User";
import { MemberCount } from "./MemberCount";

@Entity({ name: "Companies" })
export class Company {
  @PrimaryColumn({ type: "varchar", unsigned: true, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  companyName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  taxCode?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  companyEmail?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  companyWebsite?: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  companyAddress!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  provinceId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  recruiterId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  memberCountId!: string;

  @Column({ type: "text", nullable: true })
  companyIntroduce?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  companyLogo?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  companyBanner?: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  companyDescription?: string;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive!: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "integer", nullable: false, default: 0 })
  status!: number;

  @Column({ type: "varchar", length: 1000, nullable: true })
  feedbackFromManager?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @ManyToOne(() => Province, (province) => province.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "provinceId" })
  province!: Province;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recruiterId" })
  recruiter!: User;

  @ManyToOne(() => MemberCount, (memberCount) => memberCount.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "memberCountId" })
  memberCount!: MemberCount;
}
