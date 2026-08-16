import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('account/profile')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: { userId: string }) {
    const found = await this.usersService.findById(user.userId);
    if (!found) return null;
    const { passwordHash, otp, refreshTokenHash, ...safe } = found.toObject();
    return safe;
  }

  @Patch()
  async updateProfile(@CurrentUser() user: { userId: string }, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.userId, dto);
    if (!updated) return null;
    const { passwordHash, otp, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }
}
