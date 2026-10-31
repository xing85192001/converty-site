"use client";

import type { CSSProperties } from "react";
import styles from "./hero-illustration.module.css";

/**
 * Hero illustration for the homepage: a glowing math cube that rotates in true
 * 3D, rendered entirely with CSS (no video asset). Using CSS means the cube
 * inherits the site's color tokens (--color-primary / --color-card), so it blends
 * with the light/dark interface, its size is fully controllable, and there is no
 * load flash or layout shift. Honors `prefers-reduced-motion` (static frame).
 */

const FACES = [
	{ cls: styles.faceFront, sym: "Σ" },
	{ cls: styles.faceBack, sym: "π" },
	{ cls: styles.faceRight, sym: "√" },
	{ cls: styles.faceLeft, sym: "÷" },
	{ cls: styles.faceTop, sym: "×" },
	{ cls: styles.faceBottom, sym: "∞" },
];

export function HeroIllustration({ className }: { className?: string }) {
	return (
		<div className={className}>
			<div
				className="rounded-2xl border border-border bg-card p-6 shadow-sm"
				aria-hidden="true"
			>
				<div
					className={styles.scene}
					style={{ "--cube-size": "210px" } as CSSProperties}
				>
					<div className={styles.cube}>
						{FACES.map((face) => (
							<div key={face.cls} className={`${styles.face} ${face.cls}`}>
								{Array.from({ length: 9 }).map((_, k) => {
									if (k === 4) {
										return (
											<div key={k} className={styles.cellSym}>
												{face.sym}
											</div>
										);
									}
									if (k % 3 === 0) {
										return <div key={k} className={styles.cellAlt} />;
									}
									return <div key={k} className={styles.cell} />;
								})}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
