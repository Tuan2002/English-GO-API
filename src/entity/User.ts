import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupRole } from "./GroupRole";
import { Profile } from "./Profile";
import { EGenderStatus } from "@/interfaces/user/UserDTO";

@Entity({ name: "Users" })
export class User {
  @PrimaryColumn({ type: "varchar", unsigned: true, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password!: string;

  @Column({ type: "varchar", length: 1000, nullable: false })
  fullName!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  groupRoleId!: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", nullable: true })
  birthday?: string;

  @Column({ type: "char", length: 1, enum: EGenderStatus, default: EGenderStatus.MALE })
  gender!: EGenderStatus;

  @Column({ type: "varchar", length: 1000, nullable: true })
  avatar?: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  banner?: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isBlocked!: boolean;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive!: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  isUpdated!: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @ManyToOne(() => GroupRole, (groupRole) => groupRole.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "groupRoleId" })
  groupRole!: GroupRole;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;
}
