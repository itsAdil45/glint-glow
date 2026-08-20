import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

// Sensible default folder — keeps product images grouped and easy to find/
// manage from the Cloudinary dashboard, separate from any other asset types
// that might get their own upload endpoints later.
const CLOUDINARY_FOLDER = 'glint-glow/products';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      // No disk writes at all — the buffer is streamed straight to
      // Cloudinary, so there's nothing local to clean up on success or
      // failure.
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
      fileFilter: (_req, file, cb) => {
        if (!/\/(jpg|jpeg|png|webp)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only JPG, PNG, or WEBP images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    this.logger.log(
      `Processing upload: originalname="${file.originalname}" mimetype=${file.mimetype} size=${file.size}B`,
    );

    let result: UploadApiResponse;
    try {
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: 'image',
            // Cloudinary generates both derived sizes at upload time (rather
            // than on first request) and hands back their URLs directly in
            // the response, so we don't need Sharp locally anymore.
            eager: [
              { width: 1600, height: 1600, crop: 'limit', fetch_format: 'webp', quality: 'auto:good' },
              { width: 400, height: 400, crop: 'limit', fetch_format: 'webp', quality: 'auto:eco' },
            ],
            eager_async: false,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) return reject(error ?? new Error('Cloudinary returned no result'));
            resolve(uploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Cloudinary upload failed for "${file.originalname}" (${file.mimetype}, ${file.size}B): ${message}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Image upload failed: ${message}. Check the backend console for details.`,
      );
    }

    const [optimized, thumb] = result.eager ?? [];
    if (!optimized?.secure_url || !thumb?.secure_url) {
      this.logger.error(
        `Cloudinary response missing expected eager transforms for public_id=${result.public_id}`,
      );
      throw new InternalServerErrorException('Image upload succeeded but optimization failed. Try again.');
    }

    // Same response shape as before ({ url, thumbnailUrl }), so admin's
    // uploadImage() call site and the rest of the product-image flow don't
    // need to change at all — only the values are now absolute Cloudinary
    // URLs instead of "/uploads/...".
    return {
      url: optimized.secure_url,
      thumbnailUrl: thumb.secure_url,
    };
  }
}
