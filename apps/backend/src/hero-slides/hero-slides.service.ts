import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroSlide, HeroSlideDocument } from './schemas/hero-slide.schema';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';

@Injectable()
export class HeroSlidesService {
  constructor(@InjectModel(HeroSlide.name) private heroSlideModel: Model<HeroSlideDocument>) {}

  findActive() {
    return this.heroSlideModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).exec();
  }

  findAllAdmin() {
    return this.heroSlideModel.find().sort({ order: 1, createdAt: 1 }).exec();
  }

  create(dto: CreateHeroSlideDto) {
    const slide = new this.heroSlideModel(dto);
    return slide.save();
  }

  async update(id: string, dto: UpdateHeroSlideDto) {
    const slide = await this.heroSlideModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!slide) throw new NotFoundException('Hero slide not found');
    return slide;
  }

  async remove(id: string) {
    const result = await this.heroSlideModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Hero slide not found');
    return { message: 'Hero slide removed' };
  }
}
