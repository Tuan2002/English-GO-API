import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { PlanDetail } from "./PlanDetail";
import { PlanType } from "./PlanType";

@Entity({ name: "PlanAttributes" })
export class PlanAttribute {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  displayName!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  dataType!: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @Column({ type: "boolean", nullable: false, default: false })
  isDefault!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  planTypeId?: string;

  @ManyToOne(() => PlanType, (planType) => planType.planAttributes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "planTypeId" })
  planType!: PlanType;

  @OneToMany(() => PlanDetail, (planDetail) => planDetail.attribute)
  planDetails!: PlanDetail[];
}
