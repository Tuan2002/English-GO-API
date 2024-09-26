import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Function } from "./Function";
import { GroupRole } from "./GroupRole";

@Entity({ name: "Permissions" })
export class Permission {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  groupRoleId!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  functionId!: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @ManyToOne(() => Function, (func) => func.permissions)
  @JoinColumn({ name: "functionId" })
  function!: Function;

  @ManyToOne(() => GroupRole, (groupRole) => groupRole.users)
  @JoinColumn({ name: "groupRoleId" })
  groupRole!: GroupRole;
}
