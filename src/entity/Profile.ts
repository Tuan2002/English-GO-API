import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";

enum EGenderStatus {
  FEMALE = "F",
  MALE = "M",
  OTHER = "O",
}

@Entity({ name: "Profiles" })
export class Profile {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  userId!: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  address?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ type: "date", nullable: true })
  birthday?: Date;

  @Column({ type: "char", length: 1, enum: EGenderStatus, default: EGenderStatus.MALE })
  sex!: EGenderStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  banner?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  profession?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  position?: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user!: User;
}
