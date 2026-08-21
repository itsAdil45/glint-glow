import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<BannerDocument>) {}

  findActive() {
    return this.bannerModel.find({ isActive: true }).sort({ position: 1, createdAt: 1 }).exec();
  }

  findAllAdmin() {
    return this.bannerModel.find().sort({ position: 1, createdAt: 1 }).exec();
  }

  create(dto: CreateBannerDto) {
    const banner = new this.bannerModel(dto);
    return banner.save();
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async remove(id: string) {
    const result = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Banner not found');
    return { message: 'Banner removed' };
  }
}
