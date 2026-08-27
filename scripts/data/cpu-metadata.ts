/**
 * CPU metadata enrichment table
 *
 * Maps processor name patterns to metadata not available in SPEC CSV:
 * family (microarchitecture), TDP, socket type, generation.
 *
 * TDP values are typical rated values per product family.
 * Patterns are matched in order — first match wins.
 */

export interface CpuMetadataPattern {
  pattern: RegExp;
  family: string;
  tdpW: number;
  socketType: string;
  generation: "current" | "previous";
}

export const cpuMetadataPatterns: CpuMetadataPattern[] = [
  // ─── Intel Xeon 6 / Granite Rapids (6th Gen, 2024+) ───
  {
    pattern: /Xeon\s+6\d{3}/i,
    family: "Granite Rapids",
    tdpW: 350,
    socketType: "LGA4710",
    generation: "current",
  },

  // ─── Intel Xeon w9/w7/w5/w3 — Sapphire Rapids Workstation ───
  {
    pattern: /Xeon\s+w[3579]-\d{4}/i,
    family: "Sapphire Rapids",
    tdpW: 350,
    socketType: "LGA4677",
    generation: "current",
  },

  // ─── Intel Xeon — Emerald Rapids (5th Gen, 2024) ───
  {
    pattern: /Xeon.*Platinum\s+8[56]9\d/i,
    family: "Emerald Rapids",
    tdpW: 350,
    socketType: "LGA4677",
    generation: "current",
  },
  {
    pattern: /Xeon.*Gold\s+65[4-9]\d/i,
    family: "Emerald Rapids",
    tdpW: 250,
    socketType: "LGA4677",
    generation: "current",
  },

  // ─── Intel Xeon — Sapphire Rapids (4th Gen, 2023) ───
  {
    pattern: /Xeon.*Platinum\s+8[45]\d\d/i,
    family: "Sapphire Rapids",
    tdpW: 350,
    socketType: "LGA4677",
    generation: "current",
  },
  {
    pattern: /Xeon.*Gold\s+6[45]\d\d/i,
    family: "Sapphire Rapids",
    tdpW: 225,
    socketType: "LGA4677",
    generation: "current",
  },
  {
    pattern: /Xeon.*Gold\s+5[345]\d\d/i,
    family: "Sapphire Rapids",
    tdpW: 185,
    socketType: "LGA4677",
    generation: "current",
  },
  {
    pattern: /Xeon.*Silver\s+4[45]\d\d/i,
    family: "Sapphire Rapids",
    tdpW: 150,
    socketType: "LGA4677",
    generation: "current",
  },
  {
    pattern: /Xeon.*Bronze\s+3[45]\d\d/i,
    family: "Sapphire Rapids",
    tdpW: 120,
    socketType: "LGA4677",
    generation: "current",
  },

  // ─── Intel Xeon — Ice Lake (3rd Gen, 2021) ───
  {
    pattern: /Xeon.*Platinum\s+83\d\d/i,
    family: "Ice Lake",
    tdpW: 270,
    socketType: "LGA4189",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+63\d\d/i,
    family: "Ice Lake",
    tdpW: 205,
    socketType: "LGA4189",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+53\d\d[A-Z]?$/i,
    family: "Ice Lake",
    tdpW: 185,
    socketType: "LGA4189",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Silver\s+43\d\d/i,
    family: "Ice Lake",
    tdpW: 150,
    socketType: "LGA4189",
    generation: "previous",
  },

  // ─── Intel Xeon — Cascade Lake (2nd Gen, 2019) ───
  {
    pattern: /Xeon.*Platinum\s+82\d\d/i,
    family: "Cascade Lake",
    tdpW: 205,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Platinum\s+92\d\d/i,
    family: "Cascade Lake AP",
    tdpW: 250,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+62\d\d/i,
    family: "Cascade Lake",
    tdpW: 150,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+52\d\d/i,
    family: "Cascade Lake",
    tdpW: 105,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Silver\s+42\d\d/i,
    family: "Cascade Lake",
    tdpW: 85,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Bronze\s+32\d\d/i,
    family: "Cascade Lake",
    tdpW: 85,
    socketType: "LGA3647",
    generation: "previous",
  },

  // ─── Intel Xeon — Skylake-SP (1st Gen Scalable, 2017) ───
  {
    pattern: /Xeon.*Platinum\s+81\d\d/i,
    family: "Skylake-SP",
    tdpW: 205,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+61\d\d/i,
    family: "Skylake-SP",
    tdpW: 150,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Gold\s+51\d\d/i,
    family: "Skylake-SP",
    tdpW: 105,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Silver\s+41\d\d/i,
    family: "Skylake-SP",
    tdpW: 85,
    socketType: "LGA3647",
    generation: "previous",
  },
  {
    pattern: /Xeon.*Bronze\s+31\d\d/i,
    family: "Skylake-SP",
    tdpW: 85,
    socketType: "LGA3647",
    generation: "previous",
  },

  // ─── Intel Xeon E5/E7 — Broadwell-EP (2016) ───
  {
    pattern: /Xeon\s+E5-\d{4}\w*\s*v4/i,
    family: "Broadwell-EP",
    tdpW: 145,
    socketType: "LGA2011-3",
    generation: "previous",
  },
  {
    pattern: /Xeon\s+E7-\d{4}\s*v4/i,
    family: "Broadwell-EX",
    tdpW: 165,
    socketType: "LGA2011-1",
    generation: "previous",
  },

  // ─── Intel Xeon E5/E7 — Haswell-EP (2014) ───
  {
    pattern: /Xeon\s+E5-\d{4}\s*v3/i,
    family: "Haswell-EP",
    tdpW: 135,
    socketType: "LGA2011-3",
    generation: "previous",
  },
  {
    pattern: /Xeon\s+E7-\d{4}\s*v3/i,
    family: "Haswell-EX",
    tdpW: 155,
    socketType: "LGA2011-1",
    generation: "previous",
  },

  // ─── Intel Xeon Max (HBM, Sapphire Rapids HBM, 2023) ───
  {
    pattern: /Xeon\s+Max\s+9\d{3}/i,
    family: "Sapphire Rapids HBM",
    tdpW: 350,
    socketType: "LGA4677",
    generation: "current",
  },

  // ─── Intel Xeon D — Embedded ───
  {
    pattern: /Xeon\s+D-\d{4}/i,
    family: "Xeon D",
    tdpW: 100,
    socketType: "BGA",
    generation: "previous",
  },

  // ─── Intel Xeon W — Workstation (various generations) ───
  {
    pattern: /Xeon\s+W-22\d\d/i,
    family: "Cascade Lake W",
    tdpW: 205,
    socketType: "LGA2066",
    generation: "previous",
  },
  {
    pattern: /Xeon\s+W-21\d\d/i,
    family: "Skylake W",
    tdpW: 140,
    socketType: "LGA2066",
    generation: "previous",
  },

  // ─── Intel Xeon E-series — Entry (Coffee Lake / Rocket Lake) ───
  {
    pattern: /Xeon\s+E-\d{4}/i,
    family: "Xeon E",
    tdpW: 80,
    socketType: "LGA1200",
    generation: "previous",
  },

  // ─── Intel Xeon E5 — Ivy Bridge-EP (2013) ───
  {
    pattern: /Xeon\s+E5-\d{4}\s*v2/i,
    family: "Ivy Bridge-EP",
    tdpW: 130,
    socketType: "LGA2011",
    generation: "previous",
  },

  // ─── Intel Xeon E3 — Sandy/Ivy/Haswell ───
  {
    pattern: /Xeon\s+E3-\d{4}/i,
    family: "Xeon E3",
    tdpW: 80,
    socketType: "LGA1155",
    generation: "previous",
  },

  // ─── AMD EPYC — Turin (5th Gen, 2024) ───
  {
    pattern: /EPYC\s+99\d\d/i,
    family: "Turin",
    tdpW: 400,
    socketType: "SP5",
    generation: "current",
  },
  {
    pattern: /EPYC\s+98\d\d/i,
    family: "Turin",
    tdpW: 360,
    socketType: "SP5",
    generation: "current",
  },

  // ─── AMD EPYC — Bergamo/Siena (4th Gen density, 2023) ───
  {
    pattern: /EPYC\s+97[0-5]\d/i,
    family: "Bergamo",
    tdpW: 360,
    socketType: "SP5",
    generation: "current",
  },
  {
    pattern: /EPYC\s+8[0-5]\d\d/i,
    family: "Siena",
    tdpW: 200,
    socketType: "SP6",
    generation: "current",
  },

  // ─── AMD EPYC — Genoa (4th Gen, 2022) ───
  {
    pattern: /EPYC\s+9[0-6]\d\d/i,
    family: "Genoa",
    tdpW: 360,
    socketType: "SP5",
    generation: "current",
  },

  // ─── AMD EPYC — Milan-X (3D V-Cache, 2022) ───
  {
    pattern: /EPYC\s+7\d+F3/i,
    family: "Milan-X",
    tdpW: 280,
    socketType: "SP3",
    generation: "previous",
  },

  // ─── AMD EPYC — Milan (3rd Gen, 2021) ───
  {
    pattern: /EPYC\s+7[0-4]\d\d/i,
    family: "Milan",
    tdpW: 280,
    socketType: "SP3",
    generation: "previous",
  },
  {
    pattern: /EPYC\s+7\d{3}[A-Z]/i,
    family: "Milan",
    tdpW: 280,
    socketType: "SP3",
    generation: "previous",
  },

  // ─── AMD EPYC — Rome (2nd Gen, 2019) ───
  { pattern: /EPYC\s+7H12/i, family: "Rome", tdpW: 280, socketType: "SP3", generation: "previous" },
  {
    pattern: /EPYC\s+7F\d\d/i,
    family: "Rome",
    tdpW: 240,
    socketType: "SP3",
    generation: "previous",
  },
  {
    pattern: /EPYC\s+77\d\d/i,
    family: "Rome",
    tdpW: 225,
    socketType: "SP3",
    generation: "previous",
  },
  {
    pattern: /EPYC\s+75\d\d/i,
    family: "Rome",
    tdpW: 180,
    socketType: "SP3",
    generation: "previous",
  },
  {
    pattern: /EPYC\s+72\d\d/i,
    family: "Rome",
    tdpW: 120,
    socketType: "SP3",
    generation: "previous",
  },

  // ─── AMD EPYC — Naples (1st Gen, 2017) ───
  {
    pattern: /EPYC\s+76\d\d/i,
    family: "Naples",
    tdpW: 180,
    socketType: "SP3",
    generation: "previous",
  },
  {
    pattern: /EPYC\s+74\d\d/i,
    family: "Naples",
    tdpW: 155,
    socketType: "SP3",
    generation: "previous",
  },

  // ─── AMD EPYC 4000 series — Embedded/Edge ───
  {
    pattern: /EPYC\s+4\d{3}/i,
    family: "Genoa Embedded",
    tdpW: 200,
    socketType: "SP5",
    generation: "current",
  },

  // ─── Ampere ───
  {
    pattern: /Altra\s+Max/i,
    family: "Altra Max",
    tdpW: 250,
    socketType: "LGA4926",
    generation: "current",
  },
  {
    pattern: /Altra\s+Q/i,
    family: "Altra",
    tdpW: 250,
    socketType: "LGA4926",
    generation: "previous",
  },
  { pattern: /Altra/i, family: "Altra", tdpW: 250, socketType: "LGA4926", generation: "previous" },
  {
    pattern: /AmpereOne/i,
    family: "AmpereOne",
    tdpW: 350,
    socketType: "LGA5964",
    generation: "current",
  },

  // ─── AWS Graviton ───
  {
    pattern: /Graviton\s*4/i,
    family: "Graviton4",
    tdpW: 0,
    socketType: "Custom",
    generation: "current",
  },
  {
    pattern: /Graviton\s*3/i,
    family: "Graviton3",
    tdpW: 0,
    socketType: "Custom",
    generation: "current",
  },
  {
    pattern: /Graviton\s*2/i,
    family: "Graviton2",
    tdpW: 0,
    socketType: "Custom",
    generation: "previous",
  },

  // ─── Fujitsu A64FX ───
  { pattern: /A64FX/i, family: "A64FX", tdpW: 160, socketType: "Custom", generation: "previous" },

  // ─── HiSilicon Kunpeng ───
  {
    pattern: /Kunpeng\s*920/i,
    family: "Kunpeng 920",
    tdpW: 180,
    socketType: "Custom",
    generation: "previous",
  },
];

/**
 * Find metadata for a processor name. Returns undefined if no pattern matches.
 */
export function findCpuMetadata(processorName: string): CpuMetadataPattern | undefined {
  return cpuMetadataPatterns.find((entry) => entry.pattern.test(processorName));
}
