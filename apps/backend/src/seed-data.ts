/**
 * Run with: npm run seed:data
 * Seeds sample categories and products so the storefront/admin have
 * something to look at. Safe to re-run — it skips categories/products
 * that already exist (matched by slug).
 *
 * Images point to picsum.photos placeholders — swap for real uploads
 * via the admin panel whenever you're ready.
 */
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

function placeholderImage(seed: string, w = 1200, h = 1500) {
  return { url: `https://picsum.photos/seed/${seed}/${w}/${h}`, alt: seed.replace(/-/g, ' ') };
}

const categorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });

const CATEGORIES = [
  { name: 'New Arrivals', slug: 'new-arrivals' },
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Bags', slug: 'bags' },
  { name: 'Home Goods', slug: 'home-goods' },
  { name: 'Accessories', slug: 'accessories' },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(uri);

  const CategoryModel = mongoose.model('SeedCategory', categorySchema);
  const ProductModel = mongoose.model('SeedProduct', productSchema);

  // --- Categories ---
  const categoryIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    let doc = await CategoryModel.findOne({ slug: cat.slug });
    if (!doc) {
      doc = await CategoryModel.create({
        name: cat.name,
        slug: cat.slug,
        parentId: null,
        image: placeholderImage(cat.slug, 800, 800).url,
        seo: { title: cat.name, description: `Shop ${cat.name.toLowerCase()} — new arrivals and best sellers.` },
        isActive: true,
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
    categoryIds[cat.slug] = doc._id as mongoose.Types.ObjectId;
  }

  // --- Products ---
  const PRODUCTS = [
    {
      title: 'Canvas Field Jacket',
      slug: 'canvas-field-jacket',
      description:
        'A heavyweight canvas jacket built for daily wear. Brass hardware, a corduroy collar, and a boxy cut that layers well over everything.',
      shortDescription: 'Heavyweight canvas, corduroy collar.',
      brand: 'Fieldwork Co.',
      categorySlugs: ['apparel', 'new-arrivals'],
      hasVariations: true,
      attributes: [
        { name: 'Color', values: ['Olive', 'Rust', 'Black'] },
        { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      ],
      basePriceForVariants: 148,
      isFeatured: true,
    },
    {
      title: 'Waxed Cotton Tote',
      slug: 'waxed-cotton-tote',
      description:
        'A waxed cotton tote that only gets better with age. Leather straps, a magnetic snap closure, and an interior pocket sized for a laptop.',
      shortDescription: 'Waxed cotton, leather straps.',
      brand: 'Fieldwork Co.',
      categorySlugs: ['bags', 'new-arrivals'],
      hasVariations: true,
      attributes: [{ name: 'Color', values: ['Navy', 'Sand'] }],
      basePriceForVariants: 92,
      isFeatured: true,
    },
    {
      title: 'Suede Desert Boot',
      slug: 'suede-desert-boot',
      description:
        'A crepe-soled desert boot in soft suede. Two-eyelet lacing, unlined for warm-weather wear, and a low profile that works with everything from denim to tailoring.',
      shortDescription: 'Crepe sole, two-eyelet suede.',
      brand: 'Norther',
      categorySlugs: ['footwear'],
      hasVariations: true,
      attributes: [
        { name: 'Color', values: ['Sand', 'Chocolate'] },
        { name: 'Size', values: ['8', '9', '10', '11', '12'] },
      ],
      basePriceForVariants: 165,
      isFeatured: false,
    },
    {
      title: 'Ribbed Wool Beanie',
      slug: 'ribbed-wool-beanie',
      description: 'A close-ribbed beanie in merino wool. Unlined, double-folded cuff, one size fits most.',
      shortDescription: 'Merino wool, double-folded cuff.',
      brand: 'Norther',
      categorySlugs: ['accessories'],
      hasVariations: true,
      attributes: [{ name: 'Color', values: ['Charcoal', 'Camel', 'Forest'] }],
      basePriceForVariants: 38,
      isFeatured: false,
    },
    {
      title: 'Stoneware Coffee Mug',
      slug: 'stoneware-coffee-mug',
      description:
        'A hand-glazed stoneware mug thrown in small batches. Slightly different from piece to piece — that is the point.',
      shortDescription: 'Hand-glazed, small-batch stoneware.',
      brand: 'Farrow Studio',
      categorySlugs: ['home-goods'],
      hasVariations: false,
      basePrice: 24,
      stock: 60,
      isFeatured: true,
    },
    {
      title: 'Linen Throw Blanket',
      slug: 'linen-throw-blanket',
      description:
        'A washed-linen throw with a substantial weight, finished with a whipstitched edge. Softens with every wash.',
      shortDescription: 'Washed linen, whipstitched edge.',
      brand: 'Farrow Studio',
      categorySlugs: ['home-goods'],
      hasVariations: false,
      basePrice: 78,
      stock: 34,
      isFeatured: false,
    },
    {
      title: 'Leather Card Holder',
      slug: 'leather-card-holder',
      description:
        'A slim card holder in vegetable-tanned leather, hand-stitched with waxed thread. Holds four to six cards comfortably.',
      shortDescription: 'Vegetable-tanned, hand-stitched.',
      brand: 'Norther',
      categorySlugs: ['accessories'],
      hasVariations: false,
      basePrice: 46,
      stock: 80,
      isFeatured: false,
    },
    {
      title: 'Cotton Poplin Shirt',
      slug: 'cotton-poplin-shirt',
      description:
        'A crisp poplin shirt cut for a relaxed fit. Mother-of-pearl buttons, single chest pocket, and a shirttail hem.',
      shortDescription: 'Relaxed fit, mother-of-pearl buttons.',
      brand: 'Fieldwork Co.',
      categorySlugs: ['apparel'],
      hasVariations: true,
      attributes: [
        { name: 'Color', values: ['White', 'Sky Blue'] },
        { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      ],
      basePriceForVariants: 88,
      isFeatured: false,
    },
  ];

  const createdProducts: Record<string, mongoose.Types.ObjectId> = {};

  for (const p of PRODUCTS) {
    const existing = await ProductModel.findOne({ slug: p.slug });
    if (existing) {
      console.log(`Product already exists: ${p.title}`);
      createdProducts[p.slug] = existing._id as mongoose.Types.ObjectId;
      continue;
    }

    const categoryIdsForProduct = p.categorySlugs.map((s) => categoryIds[s]).filter(Boolean);
    const images = [
      placeholderImage(`${p.slug}-1`),
      placeholderImage(`${p.slug}-2`),
      placeholderImage(`${p.slug}-3`),
    ];

    let variations: unknown[] = [];
    if (p.hasVariations && p.attributes) {
      const combos = p.attributes.reduce<Record<string, string>[]>(
        (acc, attr) => {
          const next: Record<string, string>[] = [];
          for (const combo of acc) {
            for (const value of attr.values) next.push({ ...combo, [attr.name]: value });
          }
          return next;
        },
        [{}],
      );
      variations = combos.map((combo) => ({
        sku: `${p.slug}-${Object.values(combo).join('-').toLowerCase().replace(/\s+/g, '-')}`,
        attributes: combo,
        price: p.basePriceForVariants,
        stock: 15,
        images: [placeholderImage(`${p.slug}-${Object.values(combo).join('-')}`)],
        isActive: true,
      }));
    }

    const doc = await ProductModel.create({
      title: p.title,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      brand: p.brand,
      categoryIds: categoryIdsForProduct,
      images,
      basePrice: p.hasVariations ? p.basePriceForVariants : p.basePrice,
      hasVariations: p.hasVariations,
      attributes: p.attributes || [],
      variations,
      stock: p.hasVariations ? 0 : p.stock,
      isPublished: true,
      isFeatured: p.isFeatured,
      relatedProductIds: [],
      ratingsAvg: 0,
      ratingsCount: 0,
      seo: { title: p.title, description: p.shortDescription, keywords: [] },
    });
    createdProducts[p.slug] = doc._id as mongoose.Types.ObjectId;
    console.log(`Created product: ${p.title}`);
  }

  // --- Wire up a few related-product links now that everything exists ---
  const relations: [string, string[]][] = [
    ['canvas-field-jacket', ['cotton-poplin-shirt', 'ribbed-wool-beanie']],
    ['cotton-poplin-shirt', ['canvas-field-jacket', 'leather-card-holder']],
    ['waxed-cotton-tote', ['leather-card-holder', 'ribbed-wool-beanie']],
    ['suede-desert-boot', ['ribbed-wool-beanie', 'leather-card-holder']],
  ];
  for (const [slug, relatedSlugs] of relations) {
    const relatedIds = relatedSlugs.map((s) => createdProducts[s]).filter(Boolean);
    if (createdProducts[slug] && relatedIds.length) {
      await ProductModel.updateOne({ _id: createdProducts[slug] }, { relatedProductIds: relatedIds });
    }
  }

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
