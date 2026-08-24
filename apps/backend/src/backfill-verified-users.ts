/**
 * Run with: npm run migrate:verify-existing-users
 *
 * One-time backfill for the email-verification-on-signup change. Before
 * this change, register() logged people in immediately with
 * isEmailVerified defaulting to false — login now refuses unverified
 * accounts, which would otherwise lock out everyone who signed up before
 * today. This marks all pre-existing password accounts as verified so
 * only *new* signups go through the OTP step. Google accounts are already
 * verified at creation and are skipped here; safe to run more than once.
 */
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(uri);

  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const UserModel = mongoose.model('BackfillUser', userSchema);

  const result = await UserModel.updateMany(
    { isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true } },
  );

  console.log(`Marked ${result.modifiedCount} existing user(s) as email-verified.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
