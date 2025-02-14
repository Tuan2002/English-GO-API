import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Plan } from "./Plan";
import { PlanAttribute } from "./PlanAttribute";

@Entity({ name: "PlanDetails" })
export class PlanDetail {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  planId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  attributeId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  value!: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  note?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy!: string;

  @ManyToOne(() => Plan, (plan) => plan.planDetails, { onDelete: "CASCADE" })
  @JoinColumn({ name: "planId" })
  plan!: Plan;

  @ManyToOne(() => PlanAttribute, (planAttribute) => planAttribute.planDetails, { onDelete: "CASCADE" })
  @JoinColumn({ name: "attributeId" })
  attribute!: PlanAttribute;
}
