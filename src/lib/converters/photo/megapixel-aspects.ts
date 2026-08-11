export interface AspectVariation {
  name: string;
  ratioW: number;
  ratioH: number;
  width: number;
  height: number;
  megapixels: number;
  useCases: string;
}

export function calculateMegapixelAspects(targetMegapixels: number): AspectVariation[] {
  if (targetMegapixels <= 0) {
    return [];
  }

  const totalPixels = targetMegapixels * 1000000;

  const aspects = [
    { name: "1:1 Square", ratioW: 1, ratioH: 1, useCases: "Instagram, profile photos" },
    { name: "4:3 Standard", ratioW: 4, ratioH: 3, useCases: "Compact cameras, tablets" },
    { name: "3:2 Classic", ratioW: 3, ratioH: 2, useCases: "35mm film, DSLRs" },
    { name: "16:9 Wide", ratioW: 16, ratioH: 9, useCases: "HD video, monitors" },
    { name: "21:9 Ultra-wide", ratioW: 21, ratioH: 9, useCases: "Cinema, ultra-wide monitors" },
    { name: "5:4 Medium", ratioW: 5, ratioH: 4, useCases: "Large format, prints" },
    { name: "4:5 Portrait", ratioW: 4, ratioH: 5, useCases: "Portrait photos" },
    { name: "2:3 Portrait", ratioW: 2, ratioH: 3, useCases: "Phone vertical" },
    { name: "9:16 Story", ratioW: 9, ratioH: 16, useCases: "Phone stories, reels" },
  ];

  return aspects.map(({ name, ratioW, ratioH, useCases }) => {
    // width × height = totalPixels
    // width / height = ratioW / ratioH
    const height = Math.sqrt(totalPixels / (ratioW / ratioH));
    const width = height * (ratioW / ratioH);

    return {
      name,
      ratioW,
      ratioH,
      width: Math.round(width),
      height: Math.round(height),
      megapixels: Math.round(((width * height) / 1000000) * 100) / 100,
      useCases,
    };
  });
}

export const MEGAPIXEL_PRESETS = [
  { value: 2, label: "2 MP" },
  { value: 5, label: "5 MP" },
  { value: 8, label: "8 MP" },
  { value: 12, label: "12 MP" },
  { value: 24, label: "24 MP" },
  { value: 36, label: "36 MP" },
  { value: 50, label: "50 MP" },
  { value: 100, label: "100 MP" },
];
