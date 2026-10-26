/**
 * Hero illustration for the homepage: a soft, flat (2.5D) calculator with
 * floating app-style tool cards. Pure inline SVG — no external assets.
 * Decorative only (aria-hidden); all meaning lives in the adjacent hero copy.
 *
 * Approved style (v8): flat fintech vector look — blue-and-white calculator
 * slightly tilted, dark display with digits, light button grid; four floating
 * rounded cards (left: green bar chart + blue search; right: blue percent +
 * red calendar); "Simple Tools Better Life" tagline top-right with swash.
 */

export function HeroIllustration({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 600 440"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="v8-body" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffffff" />
					<stop offset="100%" stopColor="#eaf0fe" />
				</linearGradient>
				<linearGradient id="v8-screen" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#1e2a5e" />
					<stop offset="100%" stopColor="#15203f" />
				</linearGradient>
			</defs>

			{/* soft periwinkle backdrop */}
			<circle cx="300" cy="218" r="182" fill="#e9edfb" />
			<circle cx="276" cy="246" r="120" fill="#f3f6fd" opacity="0.9" />

			{/* ===== floating card: green bar chart ===== */}
			<g>
				<rect
					x="64"
					y="104"
					width="86"
					height="86"
					rx="20"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="86" y="158" width="12" height="20" rx="3" fill="#a7ebc6" />
				<rect x="104" y="146" width="12" height="32" rx="3" fill="#6fdc9d" />
				<rect x="122" y="132" width="12" height="46" rx="3" fill="#22c55e" />
				<path
					d="M86 150l18-14 14 10 16-16"
					stroke="#22c55e"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* ===== floating card: blue search ===== */}
			<g>
				<rect
					x="52"
					y="226"
					width="86"
					height="82"
					rx="20"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<circle
					cx="88"
					cy="262"
					r="15"
					fill="none"
					stroke="var(--primary)"
					strokeWidth="4"
				/>
				<line
					x1="99"
					y1="273"
					x2="110"
					y2="284"
					stroke="var(--primary)"
					strokeWidth="5"
					strokeLinecap="round"
				/>
			</g>

			{/* ===== floating card: blue percent ===== */}
			<g>
				<rect
					x="450"
					y="104"
					width="86"
					height="86"
					rx="20"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<text
					x="493"
					y="160"
					textAnchor="middle"
					fill="var(--primary)"
					fontSize="38"
					fontWeight="800"
					fontFamily="Inter, system-ui, sans-serif"
				>
					%
				</text>
			</g>

			{/* ===== floating card: red calendar ===== */}
			<g>
				<rect
					x="462"
					y="226"
					width="86"
					height="82"
					rx="20"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="480" y="244" width="50" height="34" rx="8" fill="#fde8ec" />
				<rect x="480" y="244" width="50" height="11" rx="5.5" fill="#e23e57" />
				<rect x="488" y="262" width="6" height="6" rx="2" fill="#e23e57" />
				<rect x="504" y="262" width="6" height="6" rx="2" fill="#e23e57" />
				<rect x="520" y="262" width="6" height="6" rx="2" fill="#e23e57" />
			</g>

			{/* ===== calculator (slightly tilted) ===== */}
			<g transform="rotate(-6 300 220)">
				<ellipse
					cx="300"
					cy="372"
					rx="96"
					ry="14"
					fill="#263ccb"
					opacity="0.07"
				/>
				<rect
					x="220"
					y="104"
					width="160"
					height="252"
					rx="30"
					fill="url(#v8-body)"
					stroke="#dfe6f5"
					strokeWidth="1.5"
				/>
				<rect
					x="242"
					y="126"
					width="116"
					height="56"
					rx="14"
					fill="url(#v8-screen)"
				/>
				<text
					x="300"
					y="164"
					textAnchor="middle"
					fill="#ffffff"
					fontSize="25"
					fontWeight="700"
					letterSpacing="2"
					fontFamily="Inter, system-ui, sans-serif"
				>
					12345678
				</text>
				<g fill="#dbe3fa">
					<rect x="244" y="206" width="22" height="22" rx="6" />
					<rect x="274" y="206" width="22" height="22" rx="6" />
					<rect x="304" y="206" width="22" height="22" rx="6" />
					<rect x="334" y="206" width="22" height="22" rx="6" />
					<rect x="244" y="238" width="22" height="22" rx="6" />
					<rect x="274" y="238" width="22" height="22" rx="6" />
					<rect x="304" y="238" width="22" height="22" rx="6" />
					<rect x="334" y="238" width="22" height="22" rx="6" />
					<rect x="244" y="270" width="22" height="22" rx="6" />
					<rect x="274" y="270" width="22" height="22" rx="6" />
					<rect x="304" y="270" width="22" height="22" rx="6" />
					<rect x="334" y="270" width="22" height="22" rx="6" />
					<rect x="244" y="302" width="22" height="22" rx="6" />
					<rect x="274" y="302" width="22" height="22" rx="6" />
					<rect x="304" y="302" width="22" height="22" rx="6" />
					<rect x="334" y="302" width="22" height="22" rx="6" />
				</g>
			</g>

			{/* ===== tagline + swash ===== */}
			<text
				x="512"
				y="70"
				textAnchor="middle"
				fill="var(--primary)"
				fontSize="18"
				fontWeight="800"
				fontFamily="Inter, system-ui, sans-serif"
			>
				Simple Tools
			</text>
			<text
				x="512"
				y="92"
				textAnchor="middle"
				fill="var(--primary)"
				fontSize="18"
				fontWeight="800"
				fontFamily="Inter, system-ui, sans-serif"
			>
				Better Life
			</text>
			<path
				d="M452 102q60 18 120 -4"
				stroke="var(--primary)"
				strokeWidth="2.5"
				strokeLinecap="round"
				opacity="0.45"
			/>
		</svg>
	);
}
