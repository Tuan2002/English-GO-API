import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { PlanDetail } from "./PlanDetail";
import { PlanType } from "./PlanType";

@Entity({ name: "Plans" })
export class Plan {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  planTypeId!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy!: string;

  @ManyToOne(() => PlanType, (planType) => planType.plans, { onDelete: "CASCADE" })
  @JoinColumn({ name: "planTypeId" })
  planType!: PlanType;

  @OneToMany(() => PlanDetail, (planDetail) => planDetail.plan)
  planDetails!: PlanDetail[];
}
