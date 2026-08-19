import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
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

    // Build the optimized/thumb filenames from a base that's independent of
    // the input's extension, so an already-.webp upload never collides with
    // its own optimized output (Sharp can't read and write the same file).
    const base = file.filename.replace(extname(file.filename), '');
    const optimizedName = `${base}-optimized.webp`;
    const optimizedPath = join(UPLOAD_DIR, optimizedName);
    const thumbName = `${base}-thumb.webp`;
    const thumbPath = join(UPLOAD_DIR, thumbName);

    await sharp(file.path).resize(1600, 1600, { fit: 'inside' }).webp({ quality: 82 }).toFile(optimizedPath);
    await sharp(file.path).resize(400, 400, { fit: 'inside' }).webp({ quality: 75 }).toFile(thumbPath);
    fs.unlinkSync(file.path); // remove original upload, keep optimized versions

    return {
      url: `/uploads/${optimizedName}`,
      thumbnailUrl: `/uploads/${thumbName}`,
    };
  }
}
