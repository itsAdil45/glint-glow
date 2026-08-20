import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

const EXPECTED_TEXT_INDEX_NAME = 'title_text_description_text_brand_text';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async onModuleInit() {
    // Reconciles the database's actual indexes with what the schema
    // currently declares — drops anything stale (e.g. a leftover unique
    // index from a field that was renamed or had `unique` removed) and
    // creates anything missing. Never let this fail startup: an index
    // problem should degrade to "queries are a bit slower" or "log a
    // warning", not "the API doesn't come up at all".
    try {
      // MongoDB allows only one text index per collection, and Mongoose's
      // syncIndexes() doesn't reliably diff/replace a text index when the
      // field combination it covers changes — both indexes compile to the
      // same underlying { _fts, _ftsx } keys with different names/weights,
      // and MongoDB rejects creating the new one while the old one still
      // exists (IndexOptionsConflict) rather than treating it as a rename.
      // Drop any pre-existing text index that isn't the exact one the
      // current schema wants, before letting syncIndexes handle the rest.
      const existingIndexes = await this.productModel.collection.indexes().catch(() => []);
      for (const idx of existingIndexes) {
        const isTextIndex = idx.key && idx.key._fts === 'text';
        if (isTextIndex && idx.name && idx.name !== EXPECTED_TEXT_INDEX_NAME) {
          this.logger.warn(`Dropping stale text index "${idx.name}" before sync`);
          await this.productModel.collection.dropIndex(idx.name).catch((err) => {
            this.logger.warn(`Could not drop index "${idx.name}": ${(err as Error).message}`);
          });
        }
      }

      await this.productModel.syncIndexes();
    } catch (err) {
      this.logger.warn(
        `Product index sync failed — continuing startup anyway: ${(err as Error).message}`,
      );
    }
  }
}
