/**
 * Hero illustration for the homepage: a soft, pastel calculator with
 * floating tool cards. Pure inline SVG — no external assets or dependencies.
 * Decorative only (aria-hidden); all meaning lives in the adjacent hero copy.
 * Style reference (approved): soft 3D pastel look, light-blue buttons,
 * deep-navy screen, blue $ badge, four floating cards (chart / image /
 * calendar / currency), "Simple Tools Better Life" tagline with swash.
 */

export function HeroIllustration({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 560 520"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="bk-body" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffffff" />
					<stop offset="100%" stopColor="#edf2fe" />
				</linearGradient>
				<linearGradient id="bk-screen" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#26325c" />
					<stop offset="100%" stopColor="#1a2342" />
				</linearGradient>
				<radialGradient id="bk-glow" cx="50%" cy="42%" r="62%">
					<stop offset="0%" stopColor="#eef1fc" />
					<stop offset="100%" stopColor="#e2e8f8" />
				</radialGradient>
			</defs>

			{/* soft periwinkle backdrop */}
			<circle cx="280" cy="246" r="234" fill="url(#bk-glow)" />

			{/* sparkles */}
			<path
				d="M112 216l4.5 10.5 10.5 4.5-10.5 4.5L112 246l-4.5-10.5L97 231l10.5-4.5L112 216z"
				fill="#aebcf0"
			/>
			<path
				d="M498 288l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5 3.5-8z"
				fill="#c3cdf2"
			/>

			{/* ===== floating card: trending chart ===== */}
			<g>
				<rect
					x="24"
					y="62"
					width="126"
					height="92"
					rx="16"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="46" y="120" width="13" height="16" rx="3.5" fill="#d7f5e3" />
				<rect x="65" y="112" width="13" height="24" rx="3.5" fill="#a7ebc6" />
				<rect x="84" y="102" width="13" height="34" rx="3.5" fill="#6fdc9d" />
				<path
					d="M46 96l20-16 13 9 21-20"
					stroke="#22c55e"
					strokeWidth="3.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M93 69l7 0 0 7"
					stroke="#22c55e"
					strokeWidth="3.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<rect x="46" y="130" width="76" height="7" rx="3.5" fill="#eef1f8" />
			</g>

			{/* ===== floating card: image tools ===== */}
			<g>
				<rect
					x="40"
					y="332"
					width="106"
					height="94"
					rx="16"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="66" y="352" width="54" height="54" rx="13" fill="#f0ebfd" />
				<circle cx="80" cy="368" r="4.5" fill="#8b5cf6" />
				<path
					d="M70 398l14-16 11 12 8-8 13 14"
					stroke="#8b5cf6"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* ===== floating card: calendar ===== */}
			<g>
				<rect
					x="398"
					y="330"
					width="106"
					height="94"
					rx="16"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="424" y="350" width="54" height="50" rx="12" fill="#e8eeff" />
				<rect x="424" y="350" width="54" height="15" rx="7.5" fill="#5b73ff" />
				<rect x="434" y="343" width="6" height="13" rx="3" fill="#b9c6ee" />
				<rect x="462" y="343" width="6" height="13" rx="3" fill="#b9c6ee" />
				<circle cx="438" cy="381" r="3.5" fill="#b9c6ee" />
				<circle cx="451" cy="381" r="3.5" fill="#b9c6ee" />
				<circle cx="464" cy="381" r="3.5" fill="#5b73ff" />
				<circle cx="438" cy="392" r="3.5" fill="#b9c6ee" />
				<circle cx="451" cy="392" r="3.5" fill="#5b73ff" />
			</g>

			{/* ===== currency badge ===== */}
			<circle cx="452" cy="196" r="33" fill="#5b73ff" />
			<circle cx="452" cy="196" r="33" fill="#ffffff" opacity="0.12" />
			<text
				x="452"
				y="208"
				textAnchor="middle"
				fill="#ffffff"
				fontSize="29"
				fontWeight="800"
				fontFamily="Inter, system-ui, sans-serif"
			>
				$
			</text>

			{/* ===== calculator ===== */}
			<ellipse
				cx="284"
				cy="446"
				rx="130"
				ry="17"
				fill="#263ccb"
				opacity="0.07"
			/>
			<rect
				x="172"
				y="100"
				width="216"
				height="328"
				rx="32"
				fill="url(#bk-body)"
				stroke="#dfe6f5"
				strokeWidth="1.5"
			/>
			{/* screen */}
			<rect
				x="198"
				y="122"
				width="164"
				height="64"
				rx="14"
				fill="url(#bk-screen)"
			/>
			<text
				x="280"
				y="167"
				textAnchor="middle"
				fill="#ffffff"
				fontSize="32"
				fontWeight="700"
				letterSpacing="3"
				fontFamily="Inter, system-ui, sans-serif"
			>
				123456
			</text>
			{/* buttons: uniform soft blue, 4 x 4 */}
			<circle cx="224" cy="224" r="15" fill="#dbe3fa" />
			<circle cx="266" cy="224" r="15" fill="#dbe3fa" />
			<circle cx="308" cy="224" r="15" fill="#dbe3fa" />
			<circle cx="350" cy="224" r="15" fill="#dbe3fa" />
			<circle cx="224" cy="262" r="15" fill="#dbe3fa" />
			<circle cx="266" cy="262" r="15" fill="#dbe3fa" />
			<circle cx="308" cy="262" r="15" fill="#dbe3fa" />
			<circle cx="350" cy="262" r="15" fill="#dbe3fa" />
			<circle cx="224" cy="300" r="15" fill="#dbe3fa" />
			<circle cx="266" cy="300" r="15" fill="#dbe3fa" />
			<circle cx="308" cy="300" r="15" fill="#dbe3fa" />
			<circle cx="350" cy="300" r="15" fill="#dbe3fa" />
			<circle cx="224" cy="338" r="15" fill="#dbe3fa" />
			<circle cx="266" cy="338" r="15" fill="#dbe3fa" />
			<circle cx="308" cy="338" r="15" fill="#dbe3fa" />
			<circle cx="350" cy="338" r="15" fill="#dbe3fa" />

			{/* ===== tagline + swash ===== */}
			<text
				x="406"
				y="56"
				textAnchor="middle"
				fill="var(--primary)"
				fontSize="20"
				fontWeight="800"
				fontFamily="Inter, system-ui, sans-serif"
			>
				Simple Tools
			</text>
			<text
				x="406"
				y="80"
				textAnchor="middle"
				fill="var(--primary)"
				fontSize="20"
				fontWeight="800"
				fontFamily="Inter, system-ui, sans-serif"
			>
				Better Life
			</text>
			<path
				d="M336 94q70 22 140 -8"
				stroke="var(--primary)"
				strokeWidth="2.5"
				strokeLinecap="round"
				opacity="0.45"
			/>
		</svg>
	);
}
