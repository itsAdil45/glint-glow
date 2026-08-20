import { apiFetch } from "@/lib/api";

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

// Shape returned by GET /categories/nav — a plain nested tree built from
// the category collection's parentId field, root -> subcategory -> leaf.
interface CategoryNavNode {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  children: CategoryNavNode[];
}

function categoryHref(slug: string) {
  return `/category/${slug}`;
}

function subcategoryToMenuEntry(sub: CategoryNavNode): MegaMenuSubcategory {
  const links: MegaMenuLink[] =
    sub.children.length > 0
      ? sub.children.map((leaf) => ({ label: leaf.name, href: categoryHref(leaf.slug) }))
      : [{ label: `All ${sub.name}`, href: categoryHref(sub.slug) }];

  return {
    label: sub.name,
    href: categoryHref(sub.slug),
    sections: [{ title: sub.name.toUpperCase(), links }],
  };
}

function rootToNavCategory(root: CategoryNavNode): NavCategory {
  return {
    label: root.name,
    href: categoryHref(root.slug),
    megaMenu: root.children.length > 0 ? root.children.map(subcategoryToMenuEntry) : undefined,
  };
}

export async function fetchMegaMenu(): Promise<NavCategory[]> {
  const [tree, brands] = await Promise.all([
    apiFetch<CategoryNavNode[]>("/categories/nav", { auth: false }).catch(() => []),
    apiFetch<string[]>("/products/meta/brands", { auth: false }).catch(() => []),
  ]);

  const categoryItems = tree.map(rootToNavCategory);

  const brandsItem: NavCategory | null =
    brands.length > 0
      ? {
          label: "Brands",
          href: "/products",
          simpleMenu: brands.map((brand) => ({
            label: brand,
            href: `/products?brand=${encodeURIComponent(brand)}`,
          })),
        }
      : null;

  return [
    { label: "Home", href: "/" },
    ...categoryItems,
    ...(brandsItem ? [brandsItem] : []),
    { label: "Contact", href: "/contact" },
  ];
}
