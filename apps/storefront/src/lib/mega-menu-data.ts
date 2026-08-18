// Dummy data for the header's mega menus. Shaped the way the real
// categories API will eventually return grouped nav data, so swapping
// `fetchMegaMenu` for a real backend call later is a one-function change —
// nothing in the header components needs to know the difference.

export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuSection {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuSubcategory {
  label: string;
  href: string;
  sections: MegaMenuSection[];
}

export interface NavCategory {
  label: string;
  href: string;
  // Two-level flyout (left subcategory list + right section grid), e.g. "Makeup"
  megaMenu?: MegaMenuSubcategory[];
  // Flat single-panel flyout (just a grid of links), e.g. "Brands"
  simpleMenu?: MegaMenuLink[];
}

const DUMMY_NAV: NavCategory[] = [
  { label: "Home", href: "/" },
  {
    label: "Makeup",
    href: "/category/makeup",
    megaMenu: [
      {
        label: "Face",
        href: "/category/makeup/face",
        sections: [
          {
            title: "FACE",
            links: [
              { label: "Foundation", href: "/products?category=foundation" },
              { label: "Concealer", href: "/products?category=concealer" },
              { label: "Primer", href: "/products?category=primer" },
              { label: "Setting Powder", href: "/products?category=setting-powder" },
              { label: "Blush", href: "/products?category=blush" },
              { label: "Highlighter", href: "/products?category=highlighter" },
            ],
          },
        ],
      },
      {
        label: "Eyes",
        href: "/category/makeup/eyes",
        sections: [
          {
            title: "EYES",
            links: [
              { label: "Eyeshadow", href: "/products?category=eyeshadow" },
              { label: "Eyeliner", href: "/products?category=eyeliner" },
              { label: "Mascara", href: "/products?category=mascara" },
              { label: "Brow Kits", href: "/products?category=brow-kits" },
            ],
          },
        ],
      },
      {
        label: "Lips",
        href: "/category/makeup/lips",
        sections: [
          {
            title: "LIPS",
            links: [
              { label: "Lipstick", href: "/products?category=lipstick" },
              { label: "Lip Gloss", href: "/products?category=lip-gloss" },
              { label: "Lip Liner", href: "/products?category=lip-liner" },
              { label: "Lip Oil", href: "/products?category=lip-oil" },
            ],
          },
        ],
      },
      {
        label: "Nails",
        href: "/category/makeup/nails",
        sections: [
          {
            title: "NAILS",
            links: [
              { label: "Nail Polish", href: "/products?category=nail-polish" },
              { label: "Nail Care", href: "/products?category=nail-care" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Skincare",
    href: "/category/skincare",
    megaMenu: [
      {
        label: "Cleansers",
        href: "/category/skincare/cleansers",
        sections: [
          {
            title: "CLEANSERS",
            links: [
              { label: "Face Wash", href: "/products?category=face-wash" },
              { label: "Micellar Water", href: "/products?category=micellar-water" },
              { label: "Exfoliants", href: "/products?category=exfoliants" },
            ],
          },
        ],
      },
      {
        label: "Moisturizers",
        href: "/category/skincare/moisturizers",
        sections: [
          {
            title: "MOISTURIZERS",
            links: [
              { label: "Day Cream", href: "/products?category=day-cream" },
              { label: "Night Cream", href: "/products?category=night-cream" },
              { label: "Body Lotion", href: "/products?category=body-lotion" },
            ],
          },
        ],
      },
      {
        label: "Serums",
        href: "/category/skincare/serums",
        sections: [
          {
            title: "SERUMS & TREATMENTS",
            links: [
              { label: "Vitamin C", href: "/products?category=vitamin-c" },
              { label: "Hyaluronic Acid", href: "/products?category=hyaluronic-acid" },
              { label: "Retinol", href: "/products?category=retinol" },
            ],
          },
        ],
      },
      {
        label: "Sun Care",
        href: "/category/skincare/sun-care",
        sections: [
          {
            title: "SUN CARE",
            links: [
              { label: "Sunscreen SPF 30", href: "/products?category=spf-30" },
              { label: "Sunscreen SPF 50", href: "/products?category=spf-50" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Lingerie",
    href: "/category/lingerie",
    megaMenu: [
      {
        label: "Bras",
        href: "/category/lingerie/bras",
        sections: [
          {
            title: "BRAS",
            links: [
              { label: "T-Shirt Bra", href: "/products?category=tshirt-bra" },
              { label: "Push-Up", href: "/products?category=push-up" },
              { label: "Wireless", href: "/products?category=wireless" },
              { label: "Sports Bra", href: "/products?category=sports-bra" },
            ],
          },
        ],
      },
      {
        label: "Panties",
        href: "/category/lingerie/panties",
        sections: [
          {
            title: "PANTIES",
            links: [
              { label: "Briefs", href: "/products?category=briefs" },
              { label: "Bikini", href: "/products?category=bikini" },
              { label: "Thong", href: "/products?category=thong" },
              { label: "High-Waist", href: "/products?category=high-waist" },
            ],
          },
        ],
      },
      {
        label: "Shapewear",
        href: "/category/lingerie/shapewear",
        sections: [
          {
            title: "SHAPEWEAR",
            links: [
              { label: "Bodysuits", href: "/products?category=bodysuits" },
              { label: "Waist Trainers", href: "/products?category=waist-trainers" },
            ],
          },
        ],
      },
      {
        label: "Sleepwear",
        href: "/category/lingerie/sleepwear",
        sections: [
          {
            title: "SLEEPWEAR",
            links: [
              { label: "Nightgowns", href: "/products?category=nightgowns" },
              { label: "Pajama Sets", href: "/products?category=pajama-sets" },
              { label: "Robes", href: "/products?category=robes" },
            ],
          },
        ],
      },
    ],
  },
  { label: "Fragrance", href: "/category/fragrance" },
  { label: "Accessories", href: "/category/accessories" },
  {
    label: "Brands",
    href: "/products",
    simpleMenu: [
      { label: "Glow Lab", href: "/products?brand=glow-lab" },
      { label: "Petal & Co.", href: "/products?brand=petal-co" },
      { label: "Bare Skin", href: "/products?brand=bare-skin" },
      { label: "Velvet House", href: "/products?brand=velvet-house" },
      { label: "Lumière", href: "/products?brand=lumiere" },
      { label: "Silk & Sable", href: "/products?brand=silk-sable" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export async function fetchMegaMenu(): Promise<NavCategory[]> {
  // TODO: replace with a real call once the categories API returns nav
  // structure, e.g. `apiFetch<NavCategory[]>("/categories/nav", { auth: false })`.
  return DUMMY_NAV;
}
