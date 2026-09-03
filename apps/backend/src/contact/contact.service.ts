import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { CreateContactMessageDto, UpdateContactMessageDto } from './dto/contact-message.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name) private contactMessageModel: Model<ContactMessageDocument>,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const saved = await new this.contactMessageModel(dto).save();

    // Best-effort — a submission still succeeds and is stored even if
    // outbound email is unreachable or misconfigured (MailService already
    // swallows send failures internally rather than throwing).
    const adminEmail = this.config.get<string>('mail.adminNotificationEmail');
    if (adminEmail) {
      await this.mailService.sendContactMessageNotification(adminEmail, dto);
    }
    await this.mailService.sendContactMessageConfirmation(dto.email, dto.name);

    return saved;
  }

  findAllAdmin() {
    return this.contactMessageModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(id: string, dto: UpdateContactMessageDto) {
    const message = await this.contactMessageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async remove(id: string) {
    const result = await this.contactMessageModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Message not found');
    return { message: 'Message removed' };
  }
}
