import { TalentCards } from '../talentcards.entity';
import { createTalentDto } from '../dto/create.talent.dto';
import { updateTalentDto } from '../dto/update.talent.dto';

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Request } from 'express';
import { TalentCardsQueryDto } from '../dto/talentCard.query.dto';
import { TalentReviews } from '../talentReviews.entity';

@Injectable()
export class TalentService {
  constructor(
    @InjectRepository(TalentCards)
    private readonly talentRepository: Repository<TalentCards>,
    @InjectRepository(TalentReviews)
    private readonly talentReviewsRepository: Repository<TalentReviews>,
  ) {}

  async getTalentCardsByUserId(userId: number) {
    const talentCards = await this.talentRepository
      .createQueryBuilder('talent')
      .leftJoinAndSelect('talent.user', 'user')
      .where('user.id = :id', { id: userId })
      .getMany();
    return { data: talentCards, amount: talentCards.length };
  }

  async getAllTalents() {
    const talents = await this.talentRepository
      .createQueryBuilder('talent')
      .leftJoinAndSelect('talent.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany();

    if (!talents || talents.length === 0) {
      throw new HttpException('Talents not found', HttpStatus.NOT_FOUND);
    }
    console.log(talents);
    return talents;
  }

  async search(query: TalentCardsQueryDto) {
    const qb = this.talentRepository.createQueryBuilder('talent');

    const talents = qb
      .leftJoinAndSelect('talent.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (query.keywords) {
      const keywords = query.keywords.split(' ');
      const keywordConditions = keywords.map((keyword, index) => {
        const keywordRegex = `\\m${keyword}\\M`;
        return `(talent.title ~* :keywordRegex${index} OR talent.description ~* :keywordRegex${index})`;
      });
      const keywordQuery = keywordConditions.join(' OR ');

      keywords.forEach((keyword, index) => {
        qb.setParameter(`keywordRegex${index}`, `\\m${keyword}\\M`);
      });

      qb.andWhere(keywordQuery);
    }

    if (query.skills) {
      const skills = query.skills.split(',').map((skill) => skill.trim());

      // Modify query to use unnest and ILIKE for case-insensitive matching
      const skillConditions = skills
        .map((_, index) => {
          return `EXISTS (SELECT 1 FROM unnest(talent.skills) AS skill WHERE skill ILIKE :skill${index})`;
        })
        .join(' AND ');

      qb.andWhere(skillConditions);

      skills.forEach((skill, index) => {
        qb.setParameter(`skill${index}`, skill);
      });
    }
    if (query.minPrice && query.maxPrice) {
      qb.andWhere('talent.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
      });
    } else if (query.minPrice) {
      qb.andWhere('talent.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    } else if (query.maxPrice) {
      qb.andWhere('talent.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    if (query.rating) {
      qb.andWhere('talent.averageRating >= :rating', {
        rating: query.rating,
      });
    }

    const filteredTalents = await talents.getMany();

    return { data: filteredTalents, total: filteredTalents.length };
  }

  // async updateTalentCard(
  //   talentCardId: number,
  //   newTalentCardBody: updateTalentDto,
  //   req: Request,
  // ) {
  //   const user = req['user'];

  //   const talentCard = await this.talentRepository.findOne({
  //     where: { id: talentCardId },
  //     relations: ['user'],
  //   });

  //   if (!talentCard) {
  //     throw new HttpException('Talent card not found', HttpStatus.NOT_FOUND);
  //   }

  //   if (user.id !== talentCard.user.id) {
  //     throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  //   }

  //   await this.talentRepository.update(
  //     { id: talentCardId },
  //     { ...newTalentCardBody },
  //   );
  //   return {
  //     message: 'Talent card updated successfully',
  //     HttpStatus: HttpStatus.OK,
  //   };
  // }

  async deleteTalentCard(talentCardId: number, req: Request) {
    const talentCard = await this.talentRepository.findOne({
      where: { id: talentCardId },
      relations: ['user'],
    });

    if (!talentCard) {
      throw new HttpException('Talent card not found', HttpStatus.NOT_FOUND);
    }
    const user = req['user'];

    if (user.id !== talentCard.user.id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.talentRepository.delete({ id: talentCardId });

    return {
      message: 'Talent card deleted successfully',
      HttpStatus: HttpStatus.OK,
    };
  }

  async saveTalentCard(data: Partial<TalentCards>): Promise<TalentCards> {
    const talentCard = this.talentRepository.create(data);
    return this.talentRepository.save(talentCard);
  }
  async getTalentRatingAverage(talentCardId: number) {
    const talentReviews = await this.talentReviewsRepository
      .createQueryBuilder('talentReviews')
      .leftJoinAndSelect('talentReviews.talentCard', 'talentCard')
      .where('talentCard.id = :id', { id: talentCardId })
      .getMany();
    const totalRatings = talentReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    const averageRating = totalRatings / talentReviews.length;
    let averageRatingRounded = parseFloat(averageRating.toFixed(2));

    if (isNaN(averageRating)) {
      averageRatingRounded = 0;
    }

    let talentCard = await this.talentRepository.findOne({
      where: { id: talentCardId },
    });

    talentCard = this.talentRepository.merge(talentCard, {
      averageRating: averageRatingRounded,
    });
    console.log(talentCard);
    await this.talentRepository.save(talentCard);
    return { data: talentCard.averageRating };
  }

  async getTalentReviews(talentCardId: number) {
    const talentReviews = await this.talentReviewsRepository
      .createQueryBuilder('talentReviews')
      .leftJoinAndSelect('talentReviews.talentCard', 'talentCard')
      .leftJoinAndSelect('talentReviews.user', 'user')
      .where('talentCard.id = :id', { id: talentCardId })
      .getMany();
    return { data: talentReviews, total: talentReviews.length };
  }

  async createTalentReview(
    body: {
      talentCardId: number;
      title: string;
      description: string;
      rating: number;
    },
    @Req() req: Request,
  ) {
    const talentCard = await this.talentRepository.findOne({
      where: { id: body.talentCardId },
    });

    if (!talentCard) {
      throw new HttpException('Talent card not found', HttpStatus.NOT_FOUND);
    }

    if (body.rating > 5 || body.rating < 1) {
      throw new HttpException('Invalid stars', HttpStatus.BAD_REQUEST);
    }

    const talentReviewData: Partial<TalentReviews> = {
      ...body,
      talentCard: talentCard,
      user: req['user'],
    };
    const talentReview = this.talentReviewsRepository.create(talentReviewData);
    await this.talentReviewsRepository.save(talentReview);

    return {
      message: 'Talent review created successfully',
      HttpStatus: HttpStatus.OK,
      data: talentReview,
    };
  }
}
