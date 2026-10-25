/**
 * Hero illustration for the homepage: a calculator with floating tool cards.
 * Pure inline SVG — no external assets or dependencies. Decorative only
 * (aria-hidden); all meaning lives in the adjacent hero copy.
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
			{/* soft brand-tinted glow */}
			<ellipse
				cx="288"
				cy="252"
				rx="252"
				ry="228"
				fill="#e6ecff"
				opacity="0.75"
			/>
			<ellipse
				cx="220"
				cy="300"
				rx="180"
				ry="150"
				fill="#eef2ff"
				opacity="0.7"
			/>

			{/* sparkles */}
			<path
				d="M118 158l5 12 12 5-12 5-5 12-5-12-12-5 12-5 5-12z"
				fill="var(--primary)"
				opacity="0.35"
			/>
			<path
				d="M486 292l4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9z"
				fill="var(--primary)"
				opacity="0.3"
			/>
			<path
				d="M96 268l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5 3.5-8z"
				fill="#8fa0e8"
				opacity="0.5"
			/>
			<path
				d="M508 108l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5 3.5-8z"
				fill="var(--primary)"
				opacity="0.25"
			/>

			{/* ===== floating card: trending chart ===== */}
			<g>
				<rect
					x="26"
					y="72"
					width="128"
					height="92"
					rx="16"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect
					x="44"
					y="128"
					width="14"
					height="20"
					rx="4"
					fill="var(--primary)"
					opacity="0.35"
				/>
				<rect
					x="64"
					y="116"
					width="14"
					height="32"
					rx="4"
					fill="var(--primary)"
					opacity="0.55"
				/>
				<rect
					x="84"
					y="104"
					width="14"
					height="44"
					rx="4"
					fill="var(--primary)"
					opacity="0.75"
				/>
				<rect
					x="104"
					y="94"
					width="14"
					height="54"
					rx="4"
					fill="var(--primary)"
				/>
				<path
					d="M46 92l16-12 12 8 18-18"
					stroke="#22c55e"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M86 70l6 0 0 6"
					stroke="#22c55e"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					transform="translate(-4 0)"
				/>
				<rect x="44" y="136" width="74" height="6" rx="3" fill="#eef1fb" />
			</g>

			{/* ===== floating badge: currency ===== */}
			<g>
				<circle cx="438" cy="164" r="42" fill="var(--primary)" opacity="0.1" />
				<circle cx="438" cy="164" r="30" fill="var(--primary)" />
				<text
					x="438"
					y="174"
					textAnchor="middle"
					fill="#ffffff"
					fontSize="26"
					fontWeight="800"
					fontFamily="Inter, system-ui, sans-serif"
				>
					$
				</text>
			</g>

			{/* ===== floating card: calendar ===== */}
			<g>
				<rect
					x="42"
					y="336"
					width="112"
					height="98"
					rx="16"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				<rect x="66" y="356" width="64" height="54" rx="10" fill="#eef1fb" />
				<rect
					x="66"
					y="356"
					width="64"
					height="16"
					rx="8"
					fill="var(--primary)"
				/>
				<rect x="76" y="348" width="6" height="14" rx="3" fill="#c7d0e8" />
				<rect x="114" y="348" width="6" height="14" rx="3" fill="#c7d0e8" />
				<circle cx="82" cy="386" r="3.5" fill="#c7d0e8" />
				<circle cx="98" cy="386" r="3.5" fill="#c7d0e8" />
				<circle cx="114" cy="386" r="3.5" fill="var(--primary)" />
				<circle cx="82" cy="398" r="3.5" fill="#c7d0e8" />
				<circle cx="98" cy="398" r="3.5" fill="var(--primary)" />
			</g>

			{/* ===== calculator ===== */}
			<g>
				<ellipse
					cx="284"
					cy="460"
					rx="140"
					ry="20"
					fill="#263ccb"
					opacity="0.08"
				/>
				<rect
					x="172"
					y="106"
					width="224"
					height="330"
					rx="32"
					fill="#ffffff"
					stroke="#e6eaf2"
					strokeWidth="1.5"
				/>
				{/* screen */}
				<rect x="198" y="128" width="172" height="68" rx="16" fill="#172343" />
				<text
					x="284"
					y="176"
					textAnchor="middle"
					fill="#ffffff"
					fontSize="34"
					fontWeight="700"
					letterSpacing="3"
					fontFamily="Inter, system-ui, sans-serif"
				>
					123456
				</text>
				{/* buttons */}
				<circle cx="226" cy="234" r="17" fill="var(--primary)" />
				<circle cx="272" cy="234" r="17" fill="#eef1fb" />
				<circle cx="318" cy="234" r="17" fill="#eef1fb" />
				<circle cx="364" cy="234" r="17" fill="#eef1fb" />
				<circle cx="226" cy="272" r="17" fill="#eef1fb" />
				<circle cx="272" cy="272" r="17" fill="var(--primary)" />
				<circle cx="318" cy="272" r="17" fill="#eef1fb" />
				<circle cx="364" cy="272" r="17" fill="#eef1fb" />
				<circle cx="226" cy="310" r="17" fill="#eef1fb" />
				<circle cx="272" cy="310" r="17" fill="#eef1fb" />
				<circle cx="318" cy="310" r="17" fill="var(--primary)" />
				<circle cx="364" cy="310" r="17" fill="#eef1fb" />
				<circle cx="226" cy="348" r="17" fill="#eef1fb" />
				<circle cx="272" cy="348" r="17" fill="#eef1fb" />
				<circle cx="318" cy="348" r="17" fill="#eef1fb" />
				<circle cx="364" cy="348" r="17" fill="var(--primary)" />
				{/* wide action button */}
				<rect
					x="208"
					y="386"
					width="152"
					height="28"
					rx="14"
					fill="var(--primary)"
					opacity="0.92"
				/>
			</g>

			{/* ===== tagline ===== */}
			<g transform="rotate(-5 400 60)">
				<text
					x="400"
					y="52"
					textAnchor="middle"
					fill="var(--primary)"
					fontSize="21"
					fontWeight="800"
					fontFamily="Inter, system-ui, sans-serif"
				>
					Simple Tools
				</text>
				<text
					x="400"
					y="78"
					textAnchor="middle"
					fill="var(--primary)"
					fontSize="21"
					fontWeight="800"
					fontFamily="Inter, system-ui, sans-serif"
				>
					Better Life
				</text>
			</g>
		</svg>
	);
}
