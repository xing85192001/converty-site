import { type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface ToolCardProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	href: string;
	/** Optional secondary line (e.g. tool count on category cards) */
	meta?: string;
	/** Optional "NEW" / "HOT" badge */
	badge?: "NEW" | "HOT";
	className?: string;
}

/**
 * Unified tool/category card used across the homepage, category pages,
 * search results and related-tools lists. One source of truth for the
 * icon box, title weight, description length, padding, radius, border and
 * hover behaviour so every surface stays visually consistent.
 */
export function ToolCard({
	icon: Icon,
	title,
	description,
	href,
	meta,
	badge,
	className,
}: ToolCardProps) {
	return (
		<Link
			href={href}
			className={cn(
				"group relative flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
		>
			{badge && (
				<span
					className={cn(
						"absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold",
						badge === "NEW"
							? "bg-primary/10 text-primary"
							: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
					)}
				>
					{badge}
				</span>
			)}
			<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Icon className="h-5 w-5" />
			</div>
			<h3 className="mt-3 font-semibold text-foreground">{title}</h3>
			{meta ? (
				<p className="mt-0.5 text-xs font-medium text-muted-foreground">{meta}</p>
			) : null}
			{description ? (
				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
					{description}
				</p>
			) : null}
		</Link>
	);
}
