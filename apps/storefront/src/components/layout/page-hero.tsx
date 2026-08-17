import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";

export function PageHero({
  title,
  subtitle,
  breadcrumbItems,
}: {
  title: string;
  subtitle?: string;
  breadcrumbItems: BreadcrumbItem[];
}) {
  return (
    <section className="relative bg-gradient-to-br from-accent-soft via-paper to-gold-soft/50 border-b border-line overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-page py-14 lg:py-20 text-center relative">
        <Breadcrumb items={breadcrumbItems} className="justify-center mb-4" />
        <h1 className="font-display text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="text-muted mt-3 max-w-lg mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
