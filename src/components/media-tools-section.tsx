import { ArrowRight, Image as ImageIcon, Video } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mediaTools } from "@/lib/registry/media-tools";

// Real media-tool ids grouped for the homepage card (no placeholder data).
const IMAGE_TOOL_IDS = [
	"image-watermark",
	"ico",
	"format-convert",
	"image-compress",
	"image-upscale",
	"image-to-pdf",
];
const VIDEO_TOOL_IDS = ["video-watermark", "video-compress", "video-to-gif"];

/**
 * Homepage "Image & Video Tools" card — the left column of the three-up
 * feature row. Groups the real media tools registry into two entries that
 * link to the all-tools browser (which lists the media group).
 */
export async function MediaToolsSection() {
	const t = await getTranslations("common");
	const tm = await getTranslations("mediaTools");
	const th = await getTranslations("home");

	const groups = [
		{
			key: "image",
			icon: ImageIcon,
			title: th("mediaGroupImage"),
			desc: th("mediaImageDesc"),
			ids: IMAGE_TOOL_IDS,
		},
		{
			key: "video",
			icon: Video,
			title: th("mediaGroupVideo"),
			desc: th("mediaVideoDesc"),
			ids: VIDEO_TOOL_IDS,
		},
	];

	return (
		<section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
			<h2 className="text-base font-bold text-foreground">
				{tm("sectionTitle")}
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				{tm("sectionSubtitle")}
			</p>
			<div className="mt-4 flex flex-col gap-2.5">
				{groups.map((group) => {
					const count = group.ids
						.map((id) => mediaTools.find((m) => m.id === id))
						.filter(Boolean).length;
					return (
						<Link
							key={group.key}
							href="/all"
							className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary"
						>
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<group.icon className="h-[18px] w-[18px]" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="flex items-center gap-2 text-sm font-semibold text-foreground">
									{group.title}
									<span className="text-xs font-normal text-muted-foreground">
										{count} {t("toolsCount")}
									</span>
								</span>
								<span className="mt-0.5 block truncate text-xs text-muted-foreground">
									{group.desc}
								</span>
							</span>
							<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
						</Link>
					);
				})}
			</div>
			<Link
				href="/all"
				className="mt-4 self-end text-xs font-medium text-primary hover:underline"
			>
				{t("homepageViewAll")}
			</Link>
		</section>
	);
}
