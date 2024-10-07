import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Organization } from "./Organization";

@Entity({ name: "ExamSchedules" })
export class ExamSchedule {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  examPeriod!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  organizationId!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization!: Organization;
}
