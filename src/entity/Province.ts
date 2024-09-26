import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Company } from "./Company";

@Entity({ name: "Provincies" })
export class Province {
  @PrimaryColumn({ type: "varchar", length: 255, nullable: false })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  provinceCode!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  provinceName!: string;

  @OneToMany(() => Company, (company) => company.provinceId)
  companies!: Company[];
}
