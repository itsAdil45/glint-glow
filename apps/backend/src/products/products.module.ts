import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

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
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async onModuleInit() {
    // Reconciles the database's actual indexes with what the schema
    // currently declares — drops anything stale (e.g. a leftover unique
    // index from a field that was renamed or had `unique` removed) and
    // creates anything missing. Mongoose's default autoIndex only ever
    // *adds* indexes on connect; it never removes ones no longer declared,
    // so a schema rename alone doesn't clean up the old index in MongoDB —
    // it just keeps enforcing uniqueness against a path nothing writes to
    // anymore, which is what caused the E11000 on variants.sku.
    await this.productModel.syncIndexes();
  }
}
