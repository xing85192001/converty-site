"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// A thin progress bar pinned to the very top of the viewport. It appears the
// moment an internal link is clicked (or the user hits back/forward) and fills
// to ~90%, then completes to 100% and fades out once the new page has rendered.
//
// Why this is needed: the site is a fully static export and all internal links
// use client-side soft navigation with prefetch disabled, so the browser's own
// native top loader never shows. Without any feedback the user cannot tell
// whether a click registered or the page stalled.
export function TopProgressBar() {
	const pathname = usePathname();
	const barRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const firstRender = useRef(true);
	const reduceRef = useRef(false);

	const clearTimer = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	const setBar = (widthPct: number, opacity: number, transition: string) => {
		const bar = barRef.current;
		if (!bar) return;
		bar.style.transition = transition;
		bar.style.width = `${widthPct}%`;
		bar.style.opacity = String(opacity);
	};

	const finish = () => {
		const bar = barRef.current;
		if (!bar) return;
		clearTimer();
		activeRef.current = false;
		if (reduceRef.current) {
			setBar(100, 1, "opacity .2s ease");
			timerRef.current = setTimeout(
				() => setBar(0, 0, "opacity .2s ease"),
				180,
			);
			return;
		}
		setBar(100, 1, "width .2s ease");
		timerRef.current = setTimeout(() => {
			setBar(100, 0, "opacity .25s ease");
			timerRef.current = setTimeout(() => setBar(0, 0, "width 0s"), 260);
		}, 200);
	};

	const start = () => {
		const bar = barRef.current;
		if (!bar) return;
		clearTimer();
		activeRef.current = true;
		if (reduceRef.current) {
			setBar(70, 1, "none");
			return;
		}
		setBar(0, 1, "width 0s");
		requestAnimationFrame(() => {
			setBar(90, 1, "width .4s ease");
		});
	};

	// Start the bar on internal anchor clicks and on back/forward navigation.
	useEffect(() => {
		reduceRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const onClick = (e: MouseEvent) => {
			if (e.defaultPrevented) return;
			if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
				return;
			}
			const target = e.target as HTMLElement | null;
			const anchor = target?.closest("a");
			if (!anchor) return;
			if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
				return;
			}
			const rel = anchor.getAttribute("rel") || "";
			if (rel.includes("external")) return;
			const href = anchor.getAttribute("href");
			if (!href) return;
			let url: URL;
			try {
				url = new URL(href, window.location.href);
			} catch {
				return;
			}
			if (url.origin !== window.location.origin) return;
			// Ignore same-page navigation (including hash-only jumps).
			if (
				url.pathname === window.location.pathname &&
				url.search === window.location.search
			) {
				return;
			}
			start();
		};

		const onPop = () => {
			if (!activeRef.current) start();
		};

		document.addEventListener("click", onClick, true);
		window.addEventListener("popstate", onPop);
		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("popstate", onPop);
		};
	}, []);

	// Finish the bar whenever the route actually changes.
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		if (activeRef.current) {
			finish();
		} else {
			// Navigation started without a click (e.g. router.push): show briefly.
			start();
			finish();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	return (
		<div
			ref={barRef}
			aria-hidden="true"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: 3,
				width: "0%",
				opacity: 0,
				background: "var(--color-primary)",
				zIndex: 100,
				pointerEvents: "none",
				willChange: "width, opacity",
			}}
		/>
	);
}
