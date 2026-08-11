#!/usr/bin/env node

/**
 * Generate PWA icons for Converty
 *
 * This script generates all required icon sizes for Progressive Web App support:
 * - 192x192px: Chrome minimum requirement
 * - 512x512px: Chrome minimum requirement
 * - 192x192px maskable: Android adaptive icon with 80% safe zone
 * - 180x180px: iOS home screen (apple-touch-icon)
 *
 * Current implementation creates a simple branded icon programmatically.
 * Replace the generateSourceIcon() function with actual branded assets later.
 */

const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

// Output directory
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

/**
 * Generate a simple source icon (1024x1024) for Converty
 * This is a placeholder that creates a gradient background with "C" letter
 * Replace this with actual branded SVG/PNG assets when available
 */
async function generateSourceIcon() {
  const size = 1024;
  const centerX = size / 2;
  const centerY = size / 2;

  // Create SVG with gradient background and "C" letter
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="180"/>
      <text
        x="${centerX}"
        y="${centerY + 120}"
        font-family="Arial, sans-serif"
        font-size="600"
        font-weight="bold"
        fill="white"
        text-anchor="middle">C</text>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Generate maskable icon with 80% safe zone
 * Maskable icons need padding to ensure content stays within the safe zone
 * when adaptive icons apply various shapes (circle, rounded square, squircle)
 */
async function generateMaskableIcon(sourceBuffer, outputSize) {
  const safeZoneRatio = 0.8; // 80% safe zone as per maskable icon spec
  const contentSize = Math.round(outputSize * safeZoneRatio);
  const padding = Math.round((outputSize - contentSize) / 2);

  // Create solid background
  const background = await sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 }, // Match gradient start color
    },
  })
    .png()
    .toBuffer();

  // Resize source to fit in safe zone
  const resizedContent = await sharp(sourceBuffer)
    .resize(contentSize, contentSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Composite resized content centered on background
  return sharp(background)
    .composite([
      {
        input: resizedContent,
        top: padding,
        left: padding,
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Main icon generation function
 */
async function generateIcons() {
  console.log("🎨 Generating PWA icons for Converty...\n");

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log("✓ Created icons directory:", ICONS_DIR);
  }

  // Generate source icon
  console.log("Generating source icon...");
  const sourceIcon = await generateSourceIcon();

  // Icon configurations
  const icons = [
    { name: "icon-192x192.png", size: 192, maskable: false },
    { name: "icon-512x512.png", size: 512, maskable: false },
    { name: "icon-192-maskable.png", size: 192, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: false },
  ];

  // Generate each icon
  for (const icon of icons) {
    const outputPath = path.join(ICONS_DIR, icon.name);

    let buffer;
    if (icon.maskable) {
      buffer = await generateMaskableIcon(sourceIcon, icon.size);
    } else {
      buffer = await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    }

    await fs.promises.writeFile(outputPath, buffer);
    console.log(
      `✓ Generated ${icon.name} (${icon.size}x${icon.size}${icon.maskable ? ", maskable" : ""})`
    );
  }

  console.log("\n✅ All PWA icons generated successfully!");
  console.log(`📁 Icons location: ${ICONS_DIR}`);
  console.log(
    "\nℹ️  These are placeholder icons. Replace generateSourceIcon() with branded assets when available."
  );
}

// Run the script
generateIcons().catch((err) => {
  console.error("❌ Error generating icons:", err);
  process.exit(1);
});
