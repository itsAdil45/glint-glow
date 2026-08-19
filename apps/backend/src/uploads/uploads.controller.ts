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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deletes a file, retrying on Windows' EBUSY/EPERM — the OS can hold a
 * read handle open for a few tens/hundreds of ms after a library like
 * Sharp finishes reading a file, so an immediate unlink can transiently
 * fail there even though nothing is actually wrong. Never throws; a
 * leftover temp file is harmless clutter, not a reason to fail the
 * request or discard output that was already generated successfully.
 */
async function unlinkBestEffort(path: string, logger: Logger, attempts = 5, delayMs = 150) {
  for (let i = 0; i < attempts; i++) {
    try {
      await fs.promises.unlink(path);
      return;
    } catch (err) {
      const isLastAttempt = i === attempts - 1;
      const code = (err as NodeJS.ErrnoException)?.code;
      if (isLastAttempt || (code !== 'EBUSY' && code !== 'EPERM')) {
        logger.warn(`Could not remove temp file ${path}: ${(err as Error).message}`);
        return;
      }
      await delay(delayMs);
    }
  }
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

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

    this.logger.log(
      `Processing upload: originalname="${file.originalname}" mimetype=${file.mimetype} size=${file.size}B path=${file.path}`,
    );

    // Build the optimized/thumb filenames from a base that's independent of
    // the input's extension, so an already-.webp upload never collides with
    // its own optimized output (Sharp can't read and write the same file).
    const base = file.filename.replace(extname(file.filename), '');
    const optimizedName = `${base}-optimized.webp`;
    const optimizedPath = join(UPLOAD_DIR, optimizedName);
    const thumbName = `${base}-thumb.webp`;
    const thumbPath = join(UPLOAD_DIR, thumbName);

    try {
      await sharp(file.path)
        .resize(1600, 1600, { fit: 'inside' })
        .webp({ quality: 82 })
        .toFile(optimizedPath);
      await sharp(file.path).resize(400, 400, { fit: 'inside' }).webp({ quality: 75 }).toFile(thumbPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Sharp processing failed for "${file.originalname}" (${file.mimetype}, ${file.size}B): ${message}`,
        err instanceof Error ? err.stack : undefined,
      );
      // Processing itself failed — clean up whatever partial output exists
      // so a retry doesn't trip over it, and this genuinely is a failure.
      for (const p of [file.path, optimizedPath, thumbPath]) {
        if (fs.existsSync(p)) await unlinkBestEffort(p, this.logger, 1);
      }
      throw new InternalServerErrorException(
        `Image processing failed: ${message}. Check the backend console for details.`,
      );
    }

    // Processing succeeded — the optimized + thumbnail files exist and are
    // usable. Removing the original upload is just housekeeping from here
    // on, so its failure (e.g. a transient Windows file lock) must never
    // turn a successful upload into a 500.
    void unlinkBestEffort(file.path, this.logger);

    return {
      url: `/uploads/${optimizedName}`,
      thumbnailUrl: `/uploads/${thumbName}`,
    };
  }
}
