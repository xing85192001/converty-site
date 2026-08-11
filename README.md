# Converty

[![CI](https://github.com/fjacquet/converty/actions/workflows/ci.yml/badge.svg)](https://github.com/fjacquet/converty/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/fjacquet/converty)](https://github.com/fjacquet/converty/blob/HEAD/LICENSE)

A comprehensive unit converter and calculator toolkit built with Next.js 16. Inspired by [toolstud.io](https://toolstud.io), Converty provides 167+ calculators across 15 categories for photography, video production, web development, networking, finance, crypto, real estate, cooking, automotive, and more.

[![Deploy to GitHub Pages](https://github.com/fjacquet/converty/actions/workflows/static.yml/badge.svg)](https://github.com/fjacquet/converty/actions/workflows/static.yml)
[![Security Scan](https://github.com/fjacquet/converty/actions/workflows/security.yml/badge.svg)](https://github.com/fjacquet/converty/actions/workflows/security.yml)
[![Release](https://img.shields.io/github/v/release/fjacquet/converty)](https://github.com/fjacquet/converty/releases/latest)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **167+ Calculators** across 15 categories
- **Global Search** with Cmd+K / Ctrl+K fuzzy search
- **Progressive Web App** with offline support and install prompt
- **Internationalization** supporting EN, FR, DE, IT locales
- **Dark/Light Mode** with system preference detection
- **Responsive Design** works on desktop and mobile
- **Shareable Links** with URL state persistence
- **No Backend Required** - all calculations run client-side
- **Browser Geolocation** for location-based calculations
- **Static Export** for easy deployment anywhere
- **Offline Package** downloadable for local use

## Download

### Online

Use Converty directly at **[fjacquet.github.io/converty](https://fjacquet.github.io/converty/)**

### Offline / Local

Download the latest release for offline use:

1. Go to [Releases](https://github.com/fjacquet/converty/releases)
2. Download `converty-local.zip`
3. Extract and run:
   - **Mac/Linux:** `./start.sh`
   - **Windows:** `start.bat`
4. Open http://localhost:3000

Requires Python 3.x (pre-installed on Mac/Linux) or Node.js 18+.

## Documentation

### For Users

**[📖 User Guide](docs/USER_GUIDE.md)** - Complete guide to using Converty's calculators:
- How to find and use calculators
- Share calculations via URL
- Install as offline PWA
- Multi-language support
- Keyboard shortcuts and tips

### For Developers

- **[Adding Calculators](docs/CALCULATOR_GUIDE.md)** - Step-by-step guide for developers
- **[Code Style](docs/CODE_STYLE.md)** - TypeScript, naming, linting conventions
- **[I18N Guide](docs/I18N_GUIDE.md)** - Internationalization patterns
- **[Engineering Patterns](docs/ENGINEERING_PATTERNS.md)** - Material databases, formulas
- **[Chemistry Patterns](docs/CHEMISTRY_PATTERNS.md)** - Chemical formula parsing

## Categories

| Category          | Calculators | Description                                                       |
| ----------------- | ----------- | ----------------------------------------------------------------- |
| **Math**          | 38          | Algebra, geometry, statistics, trigonometry, number theory        |
| **Health**        | 28          | BMI, BMR, body fat, calories, hydration, heart rate               |
| **Finance**       | 28          | Mortgage, compound interest, ROI, tax, currency, real estate      |
| **Photo**         | 22          | DoF, hyperfocal, exposure, aspect ratio, diffraction, golden hour |
| **Web**           | 10          | URL/HTML encoding, CSP generator, SEO analyzer, security checks   |
| **Video**         | 9           | File size, bitrate, frame rate, screen size, DCP, time-lapse      |
| **DateTime**      | 8           | Age, duration, timezone, countdown, date difference               |
| **Network**       | 5           | Subnet calculator, IP address, CIDR range, network speed          |
| **Crypto**        | 4           | Hash calculator, wallet converter, exchange rates, mining         |
| **Cooking**       | 4           | Recipe scaling, nutrition facts, unit conversions, food cost      |
| **Automotive**    | 4           | Fuel efficiency, tire sizing, maintenance, vehicle financing      |
| **Data**          | 3           | Data size, bandwidth, download time                               |
| **Physics**       | 1           | Speed conversion                                                  |
| **Music**         | 1           | BPM calculator                                                    |
| **Color**         | 1           | RGB/HEX/HSL converter                                             |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/fjacquet/converty.git
cd converty

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build optimized production version
npm run build

# Start production server
npm start
```

### Static Export

```bash
# Generate static HTML export
npm run build
# Output is in the 'out' directory
```

## Project Structure

```text
converty/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── photo/              # Photography calculators
│   │   ├── video/              # Video production tools
│   │   ├── web/                # Web development utilities
│   │   └── ...                 # Other categories
│   ├── components/
│   │   ├── converter/          # Reusable calculator components
│   │   ├── layout/             # Header, theme toggle
│   │   └── ui/                 # Base UI components
│   ├── lib/
│   │   ├── converters/         # Pure calculation functions
│   │   │   ├── photo/          # Photo calculation logic
│   │   │   ├── video/          # Video calculation logic
│   │   │   └── ...
│   │   └── registry/           # Converter metadata registry
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── docs/                       # Documentation
```

## Available Scripts

| Command              | Description                             |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start development server with Turbopack |
| `npm run build`      | Build for production                    |
| `npm run start`      | Start production server                 |
| `npm run type-check` | Run TypeScript compiler check           |
| `npm run format`     | Format code with Biome                  |
| `npm run lint`       | Lint code with Biome                    |

## Photography Calculators

### Depth of Field Family

- **Depth of Field** - Basic DoF from aperture, focal length, distance
- **Advanced DoF** - DoF with adjustable CoC for print size/viewing distance
- **Macro DoF** - Accurate DoF using magnification ratio
- **DoF Table** - Interactive table across apertures and distances
- **Hyperfocal Distance** - Calculate focus distance for maximum DoF
- **Circle of Confusion** - CoC from sensor, print size, viewing distance

### Diffraction Calculators

- **Diffraction** - Detect when camera becomes diffraction-limited
- **Macro Diffraction** - Effective aperture and diffraction in macro

### Exposure & Light

- **Light EV** - Calculate Exposure Value from settings
- **ND Filter** - Exposure time with neutral density filters
- **Golden Hour** - Sun times based on geolocation (with Browser Geolocation API)

### Astrophotography

- **Spot Stars** - Max exposure to prevent star trailing (NPF Rule)
- **Star Trails** - Exposure time for star trail rotation

### Composition & Framing

- **Aspect Ratio** - Calculate and convert aspect ratios
- **Aspect Fit** - Fit images with letterboxing/pillarboxing
- **Composition** - Field of view from focal length
- **Portrait Distance** - Ideal shooting distance for portraits
- **Focal Equivalent** - Match settings between sensor sizes

### Resolution & Print

- **Megapixels** - Calculate from width × height
- **Megapixel Aspects** - View MP in different aspect ratios
- **DPI Calculator** - Megapixels needed for print size
- **Image Filesize** - Estimate JPEG/PNG/RAW file sizes
- **Time Lapse** - Interval, clip length, memory calculator

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.0
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Biome](https://biomejs.dev/) 2.3
- **Build**: Turbopack (development)

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fjacquet/converty)

### Docker

```bash
# Build Docker image
docker build -t converty .

# Run container
docker run -p 3000:3000 converty
```

### Static Hosting (GitHub Pages, Netlify, etc.)

The project exports as static HTML. After building, deploy the `out` directory to any static hosting provider.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding a New Calculator

1. Create calculation logic in `src/lib/converters/{category}/{name}.ts`
2. Create page in `src/app/{category}/{name}/page.tsx`
3. Create component in `src/app/{category}/{name}/{name}-calculator.tsx`
4. Register in `src/lib/registry/converters.ts`
5. Export from `src/lib/converters/{category}/index.ts`

## Roadmap

### Shipped in v2.0

- [x] Network calculators (subnet calculator, IP address, CIDR range, network speed)
- [x] Global search (Cmd+K) with fuzzy matching
- [x] 100% internationalization (EN, FR, DE, IT)
- [x] PWA support for offline use
- [x] Shareable calculation links with URL state

### Shipped in v3.0

- [x] Calculator expansion (16 new calculators: Crypto/Blockchain, Real Estate, Cooking/Nutrition, Automotive)
- [x] Performance optimization (code splitting, lazy loading, 210 chunks)
- [x] Export results to PDF/CSV with internationalization support

### Planned for v4.0

- [ ] Favorites and calculation history
- [ ] Additional calculator categories
- [ ] Enhanced user experience features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [toolstud.io](https://toolstud.io)
- Solar calculations based on [NOAA Solar Calculator](https://gml.noaa.gov/grad/solcalc/)
- Photography formulas from [PhotoPills](https://www.photopills.com/)
