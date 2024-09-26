import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Company } from "./Company";

@Entity({ name: "MemberCounts" })
export class MemberCount {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  displayName!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  description!: string;

  @OneToMany(() => Company, (company) => company.memberCountId)
  companies!: Company[];
}
