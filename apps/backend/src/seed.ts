/**
 * Run with: npm run seed
 * Creates an initial admin user so you can log into the admin panel.
 * Reads MONGODB_URI from .env; edit the constants below before running.
 */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ADMIN_NAME = 'Store Admin';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(uri);

  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const UserModel = mongoose.model('SeedUser', userSchema);

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await UserModel.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      addresses: [],
      defaultAddressId: null,
      otp: null,
    });
    console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('Log in via POST /api/auth/login, then change this password.');
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
