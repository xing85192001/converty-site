"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";

/**
 * EditorialTrust — E-E-A-T 信任块。
 * 在博客文章页与计算器页底部展示「作者 / 审核团队 + 审核声明 + 编辑标准入口」，
 * 强化 YMYL（金融 / 健康等关乎钱与健康的）内容的经验、专业性与可信度信号。
 */
export function EditorialTrust() {
	const t = useTranslations("ui");

	return (
		<section
			aria-label="editorial trust"
			className="mt-12 rounded-xl border border-border/70 bg-muted/30 p-5 sm:p-6"
		>
			<div className="flex items-start gap-4">
				<div
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
					aria-hidden
				>
					bk
				</div>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-foreground">
						{t("editorialAuthorName")}
					</p>
					<p className="text-xs text-muted-foreground">{t("editorialAuthorRole")}</p>
				</div>
			</div>

			<p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
				<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
				<span>{t("editorialReviewNote")}</span>
			</p>

			<p className="mt-3 text-sm">
				<Link
					href="/about"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					{t("editorialLearnMore")}
				</Link>
			</p>
		</section>
	);
}
