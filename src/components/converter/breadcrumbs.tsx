import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategoryById } from "@/lib/registry/categories";

interface BreadcrumbsProps {
  categoryId: string;
  current: string;
  categoryName?: string;
}

export function Breadcrumbs({ categoryId, current, categoryName }: BreadcrumbsProps) {
  const category = getCategoryById(categoryId);

  return (
    <nav className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/" className="transition-colors hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link
        href={`/${category?.slug ?? categoryId}`}
        className="transition-colors hover:text-foreground"
      >
        {categoryName || category?.name || categoryId}
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="font-medium text-foreground">{current}</span>
    </nav>
  );
}
