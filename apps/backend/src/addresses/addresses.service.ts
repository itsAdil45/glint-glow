import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) {}

  findAllForUser(userId: string) {
    return this.addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressModel.updateMany({ userId }, { isDefault: false }).exec();
    }
    const address = new this.addressModel({ ...dto, userId });
    return address.save();
  }

  private async assertOwnership(userId: string, addressId: string) {
    const address = await this.addressModel.findById(addressId).exec();
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId.toString() !== userId) throw new ForbiddenException();
    return address;
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    await this.assertOwnership(userId, addressId);
    if (dto.isDefault) {
      await this.addressModel.updateMany({ userId }, { isDefault: false }).exec();
    }
    return this.addressModel.findByIdAndUpdate(addressId, dto, { new: true }).exec();
  }

  async remove(userId: string, addressId: string) {
    await this.assertOwnership(userId, addressId);
    await this.addressModel.findByIdAndDelete(addressId).exec();
    return { message: 'Address removed' };
  }
}
