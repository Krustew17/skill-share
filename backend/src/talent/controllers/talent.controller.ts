import { TalentService } from '../services/talent.service';
import { updateTalentDto } from '../dto/update.talent.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TalentCards } from '../talentcards.entity';
import { TalentCardsQueryDto } from '../dto/talentCard.query.dto';

@Controller('talent')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get('all')
  getAllTalentCards(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 2,
  ) {
    return this.talentService.getAllTalents(page, limit);
  }

  @Get('cards/me')
  getTalentCardsByUserId(@Req() req: Request) {
    const user = req['user'];
    const userId = user.id;
    return this.talentService.getTalentCardsByUserId(userId);
  }

  @Get('search')
  search(
    @Query() query: TalentCardsQueryDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 2,
  ) {
    return this.talentService.search(query, page, limit);
  }

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'portfolio', maxCount: 5 }], {
      storage: diskStorage({
        destination: 'uploads/portfolio',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only .png, .jpg and .jpeg format allowed!',
            ),
            false,
          );
        }
      },
    }),
  )
  async createTalentCard(
    @UploadedFiles()
    files: {
      portfolio?: Express.Multer.File[];
    },
    @Body() body: TalentCards,
    @Req() req: Request,
  ) {
    const portfolioPaths = files.portfolio
      ? files.portfolio.map((file) => file.path)
      : [];
    const skills =
      typeof body.skills === 'string' ? JSON.parse(body.skills) : body.skills;
    if (!Array.isArray(skills)) {
      throw new HttpException(
        'Skills must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.title.length > 60) {
      throw new HttpException('Title is too long', HttpStatus.BAD_REQUEST);
    }

    const talentCardData: Partial<TalentCards> = {
      ...body,
      skills,
      portfolio: portfolioPaths,
      user: req['user'],
    };

    const talentCard = await this.talentService.saveTalentCard(talentCardData);
    return {
      talentCard,
      message: 'Talent card created successfully',
      HttpStatus: HttpStatus.CREATED,
    };
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'portfolio', maxCount: 5 }], {
      storage: diskStorage({
        destination: 'uploads/portfolio',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only .png, .jpg and .jpeg format allowed!',
            ),
            false,
          );
        }
      },
    }),
  )
  updateTalentCard(
    @UploadedFiles()
    files: {
      portfolio?: Express.Multer.File[];
    },
    @Param('id') talentCardId: number,
    @Body() newTalentCardBody: updateTalentDto,
    @Req() req: Request,
  ) {
    const portfolioPaths = files.portfolio
      ? files.portfolio.map((file) => file.path)
      : [];
    return this.talentService.updateTalentCard(
      talentCardId,
      newTalentCardBody,
      portfolioPaths,
      req,
    );
  }

  @Delete('delete/:id')
  deleteTalentCard(@Param('id') talentCardId: number, @Req() req: Request) {
    return this.talentService.deleteTalentCard(talentCardId, req);
  }

  @Get('rating/average')
  getTalentRatingAverage(@Query('talentCardId') talentCardId: number) {
    return this.talentService.getTalentRatingAverage(talentCardId);
  }

  @Get('reviews')
  getTalentReviews(@Query('talentCardId') talentCardId: number) {
    return this.talentService.getTalentReviews(talentCardId);
  }

  @Post('review/create')
  createTalentReview(
    @Body()
    body: {
      talentCardId: number;
      title: string;
      description: string;
      rating: number;
    },
    @Req() req: Request,
  ) {
    return this.talentService.createTalentReview(body, req);
  }
}
