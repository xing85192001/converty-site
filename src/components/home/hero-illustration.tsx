"use client";

/**
 * Hero illustration for the homepage: a glowing neon math cube that rotates in
 * true 3D (supplied as a looping MP4, rendered from a real 3D turntable).
 * The video is wrapped in a dark periwinkle "spotlight" panel so its dark
 * space background blends seamlessly into the light hero.
 *
 * Accessibility: honors `prefers-reduced-motion` — when the user prefers
 * reduced motion the video is paused on its first frame instead of autoplaying.
 *
 * Asset: /hero-cube-3d.mp4 (in /public, copied to /out on static export).
 */

import { useEffect, useRef } from "react";

export function HeroIllustration({ className }: { className?: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => {
			const v = videoRef.current;
			if (!v) return;
			if (mq.matches) {
				v.pause();
			} else {
				// muted + programmatic play is allowed by browsers
				void v.play().catch(() => {});
			}
		};
		apply();
		mq.addEventListener?.("change", apply);
		return () => mq.removeEventListener?.("change", apply);
	}, []);

	return (
		<div className={className}>
			<div
				style={{
					background:
						"radial-gradient(circle at 50% 35%, #343a86 0%, #141a44 70%, #0b0f2e 100%)",
					borderRadius: 28,
					padding: 26,
					boxShadow: "0 30px 60px rgba(20,26,68,.35)",
				}}
			>
				<video
					ref={videoRef}
					src="/hero-cube-3d.mp4"
					className="h-auto w-full rounded-2xl"
					muted
					loop
					playsInline
					preload="auto"
				/>
			</div>
		</div>
	);
}
