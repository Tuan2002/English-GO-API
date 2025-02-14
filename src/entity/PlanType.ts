import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Plan } from "./Plan";
import { PlanAttribute } from "./PlanAttribute";

@Entity({ name: "PlanTypes" })
export class PlanType {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  displayName!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy!: string;

  @OneToMany(() => Plan, (plan) => plan.planType)
  plans!: Plan[];

  @OneToMany(() => PlanAttribute, (planAttributes) => planAttributes.planType)
  planAttributes!: PlanAttribute[];
}
