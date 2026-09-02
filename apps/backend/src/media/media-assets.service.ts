import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema';

export interface CreateMediaAssetInput {
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  filename?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface FindMediaAssetsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class MediaAssetsService {
  private readonly logger = new Logger(MediaAssetsService.name);

  constructor(@InjectModel(MediaAsset.name) private mediaAssetModel: Model<MediaAssetDocument>) {}

  /**
   * Records one library entry per upload — deliberately no dedup by file
   * content or URL. Uploading the same image twice is meant to just create
   * a second entry, same as it always created a second Cloudinary asset.
   * Called from UploadsController after a successful upload; failures here
   * are logged and swallowed so a library-write hiccup never fails the
   * upload itself (the image is already safely on Cloudinary by then).
   */
  async create(input: CreateMediaAssetInput): Promise<void> {
    try {
      await this.mediaAssetModel.create(input);
    } catch (err) {
      this.logger.warn(`Could not record media asset for ${input.url}: ${(err as Error).message}`);
    }
  }

  async findAll(query: FindMediaAssetsQuery) {
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.filename = { $regex: query.search, $options: 'i' };
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 24;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.mediaAssetModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.mediaAssetModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
