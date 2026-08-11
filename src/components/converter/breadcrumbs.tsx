import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/registry/categories";

interface BreadcrumbsProps {
  category: Category;
  current: string;
  categoryName?: string; // Translated category name (preferred over category.name)
}

export function Breadcrumbs({ category, current, categoryName }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link href={`/${category.slug}`} className="hover:text-foreground transition-colors">
        {categoryName || category.name}
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{current}</span>
    </nav>
  );
}
