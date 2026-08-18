import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroSlide, HeroSlideSchema } from './schemas/hero-slide.schema';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlidesController } from './hero-slides.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: HeroSlide.name, schema: HeroSlideSchema }])],
  providers: [HeroSlidesService],
  controllers: [HeroSlidesController],
})
export class HeroSlidesModule {}
