"use client";

import { Calculator, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Brand glyphs as inline SVG (lucide no longer ships brand icons).
function XIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function FacebookIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	);
}

function GithubIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

const socialLinks = [
	{
		label: "X (Twitter)",
		href: "https://x.com/intent/post?url=https%3A%2F%2Fbaikecalc.com",
		icon: XIcon,
	},
	{
		label: "Facebook",
		href: "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fbaikecalc.com",
		icon: FacebookIcon,
	},
	{
		label: "GitHub",
		href: "https://github.com/xing85192001/converty-site",
		icon: GithubIcon,
	},
	{ label: "Contact", href: "/contact", icon: Mail },
];

export function Footer() {
	const footer = useTranslations("common.footer");

	const links = [
		{ href: "/about", label: footer("links.about") },
		{ href: "/privacy-policy", label: footer("links.privacy") },
		{ href: "/terms", label: footer("links.terms") },
		{ href: "/contact", label: footer("links.contact") },
		{ href: "/sitemap", label: footer("links.sitemap") },
	];

	return (
		<footer className="bg-[#1c2a6e] text-white">
			<div className="mx-auto max-w-6xl px-4 py-10">
				<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
					{/* Brand */}
					<div className="max-w-xs">
						<Link href="/" className="flex items-center gap-2">
							<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
								<Calculator className="h-[18px] w-[18px] text-white" />
							</span>
							<span className="text-[17px] font-extrabold tracking-tight text-white">
								Baike<span className="text-[#9fb2ff]">Calc</span>
							</span>
						</Link>
						<p className="mt-3 text-xs leading-relaxed text-white/60">
							{footer("tagline")}
						</p>
					</div>

					{/* Policy links */}
					<nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className="text-white/70 transition-colors hover:text-white"
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Social */}
					<div className="flex items-center gap-3">
						{socialLinks.map((social) => (
							<a
								key={social.label}
								href={social.href}
								aria-label={social.label}
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
							>
								<social.icon className="h-4 w-4" />
							</a>
						))}
					</div>
				</div>

				<div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/50">
					© 2026 BaikeCalc. {footer("copyright")}
				</div>
			</div>
		</footer>
	);
}
