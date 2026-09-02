import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [MediaModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
