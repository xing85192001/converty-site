"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { type MediaCategory, mediaTools } from "@/lib/registry/media-tools";
import { cn } from "@/lib/utils";

const categoryKeys: MediaCategory[] = [
	"all",
	"watermark",
	"format",
	"icon",
	"compress",
];

export function MediaToolsSection() {
	const t = useTranslations("mediaTools");
	const [activeCategory, setActiveCategory] = useState<MediaCategory>("all");

	const filteredTools =
		activeCategory === "all"
			? mediaTools
			: mediaTools.filter((tool) => tool.categories.includes(activeCategory));

	return (
		<section className="mb-3">
			<div className="mb-4 flex items-end justify-between">
				<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
					{t("sectionTitle")}{" "}
					<small className="text-sm font-normal text-muted-foreground">
						{t("sectionSubtitle")}
					</small>
				</h2>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				{categoryKeys.map((key) => (
					<button
						key={key}
						type="button"
						onClick={() => setActiveCategory(key)}
						className={cn(
							"cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
							activeCategory === key
								? "bg-primary/10 text-primary"
								: "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
						)}
					>
						{t(`categories.${key}`)}
					</button>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{filteredTools.map((tool) => {
					const Icon = tool.icon;
					return (
						<Link
							key={tool.id}
							href={`/tools/${tool.slug}`}
							className="group relative rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Icon className="h-5 w-5" />
							</div>
							<h3 className="mt-4 text-[15px] font-semibold text-foreground">
								{t(tool.titleKey)}
							</h3>
							<p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
								{t(tool.descKey)}
							</p>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
