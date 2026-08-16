export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <h1 className="font-display text-3xl text-center">{title}</h1>
      {subtitle && <p className="text-center text-sm text-muted mt-2">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
