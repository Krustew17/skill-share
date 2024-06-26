import { TalentCards } from '../talent/talentcards.entity';
import { Earnings } from './earnings.entity';
import { UserProfile } from './user.profile.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TalentStatistics } from './user.statistics.entity';
import { TalentReviews } from '../talent/talentReviews.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'last_online_at', nullable: true })
  lastOnlineAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => TalentCards, (talent) => talent.user, { cascade: true })
  talentCards: TalentCards[];

  @OneToMany(() => Earnings, (earnings) => earnings.user, { cascade: true })
  earnings: Earnings[];

  @Column({ nullable: true })
  customerId: string;

  @Column({ default: false })
  hasPremium: boolean;

  @Column({ nullable: true })
  googleId: string;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToOne(
    () => TalentStatistics,
    (TalentStatistics) => TalentStatistics.user,
    { cascade: true },
  )
  talentStatistics: TalentStatistics;

  @OneToMany(() => TalentReviews, (talentReviews) => talentReviews.user, {
    cascade: true,
  })
  talentReviews: TalentReviews[];
}
