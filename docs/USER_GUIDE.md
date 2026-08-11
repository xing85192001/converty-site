# Converty User Guide

Welcome to Converty! This guide will help you make the most of the 167+ calculators and converters available on the platform.

## Quick Start

### Accessing Converty

**Online (Recommended)**
- Visit [fjacquet.github.io/converty](https://fjacquet.github.io/converty/)
- No installation required
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Automatic updates

**Offline / Local**
1. Download `converty-local.zip` from [GitHub Releases](https://github.com/fjacquet/converty/releases)
2. Extract the ZIP file
3. Run the start script:
   - **Mac/Linux:** Double-click `start.sh` or run `./start.sh` in terminal
   - **Windows:** Double-click `start.bat`
4. Open http://localhost:3000 in your browser

**Requirements for offline use:**
- Python 3.x (pre-installed on Mac/Linux) OR Node.js 18+

### Progressive Web App (PWA)

Install Converty as a desktop or mobile app:

1. Visit the website in Chrome, Edge, or Safari
2. Look for the "Install" button in your browser's address bar
3. Click Install
4. Converty will appear as a standalone app on your device
5. Works offline once installed!

## Finding Calculators

### Browse by Category

Converty organizes 167+ calculators into 15 categories:

| Category | Examples | Use Cases |
|----------|----------|-----------|
| **Math** (38) | Algebra, Geometry, Statistics, Trigonometry | Student homework, data analysis, geometry problems |
| **Health** (28) | BMI, BMR, Body Fat, Calorie Counter | Fitness tracking, diet planning, health monitoring |
| **Finance** (28) | Mortgage, Compound Interest, ROI, Tax | Investment planning, loan calculations, budgeting |
| **Photo** (22) | Depth of Field, Exposure, Hyperfocal Distance | Photography planning, camera settings, composition |
| **Web** (10) | URL Encoder, CSP Generator, SEO Analyzer | Web development, security, optimization |
| **Video** (9) | File Size, Bitrate, Frame Rate, Time Lapse | Video production, storage planning, editing |
| **DateTime** (8) | Age Calculator, Duration, Timezone Converter | Date calculations, time tracking, scheduling |
| **Network** (5) | Subnet Calculator, IP Address, CIDR Range | Network administration, IP planning |
| **Crypto** (4) | Hash Calculator, Mining Profitability, Exchange Rates | Cryptocurrency trading, blockchain development |
| **Cooking** (4) | Recipe Scaling, Nutrition Facts, Unit Conversion | Meal planning, dietary tracking |
| **Automotive** (4) | Fuel Efficiency, Tire Sizing, Maintenance | Vehicle maintenance, fuel cost planning |
| **Data** (3) | Data Size, Bandwidth, Download Time | Storage planning, network capacity |
| **Physics** (1) | Speed Conversion | Physics problems, unit conversion |
| **Music** (1) | BPM Calculator | Music production, tempo analysis |
| **Color** (1) | RGB/HEX/HSL Converter | Design, web development |

**How to Browse:**
1. Click on any category card on the homepage
2. View all calculators in that category
3. Click on a calculator to open it

### Global Search (Cmd+K / Ctrl+K)

The fastest way to find what you need:

1. **Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)**
2. Start typing: "mortgage", "BMI", "subnet", etc.
3. Use arrow keys to navigate results
4. Press Enter to open the selected calculator

**Search Tips:**
- Search by calculator name: "depth of field"
- Search by category: "photo calculators"
- Search by keyword: "percentage", "conversion"
- Fuzzy matching: "dof" finds "Depth of Field"

## Using Calculators

### Basic Usage

Every calculator follows a simple pattern:

1. **Enter your values** in the input fields
2. **Results calculate automatically** as you type
3. **No "Calculate" button needed** - instant results!

**Example: BMI Calculator**
```
1. Enter your height: 175 cm
2. Enter your weight: 70 kg
3. Result appears instantly: BMI = 22.9 (Normal weight)
```

### Input Fields

**Number Inputs:**
- Type directly into the field
- Use arrow keys to increment/decrement
- Most fields accept decimal values
- Negative values are allowed where appropriate

**Dropdowns:**
- Click to open the list of options
- Select your preferred option
- Some calculators update results based on your selection

**Unit Selection:**
- Many calculators support multiple units
- Change units using the dropdown next to the input
- Results automatically convert

### Results Display

Results are shown in different formats:

- **Single Result:** Large, prominent display
- **Multiple Results:** Grid of related values
- **Tables:** For calculators with many outputs
- **Charts/Graphs:** Visual representations (where applicable)

## Key Features

### Shareable Links

**Every calculator state is saved in the URL!**

This means you can:

1. **Share Calculations:**
   - Fill in calculator values
   - Copy the URL from your browser
   - Send to someone else
   - They'll see your exact inputs and results!

2. **Bookmark Calculations:**
   - Save frequently used calculations as bookmarks
   - Example: Your mortgage calculation, BMI tracking, etc.

3. **Return Later:**
   - Close the browser
   - Return to the same URL
   - All your values are preserved

**Example URL:**
```
https://fjacquet.github.io/converty/en/health/bmi?height=175&weight=70
                                                    ↑
                                        Your values stored here
```

**Privacy Note:** Values are only stored in the URL, never on any server. Your data stays private.

### Multi-Language Support

Converty is available in **4 languages**:

- **English (EN)**
- **French (FR)**
- **German (DE)**
- **Italian (IT)**

**How to Change Language:**

1. **From Homepage:**
   - Look for the language selector in the header
   - Click your preferred language
   - Entire site updates instantly

2. **Via URL:**
   - Change the locale in the URL path
   - `/en/` → English
   - `/fr/` → French
   - `/de/` → German
   - `/it/` → Italian

**What's Translated:**
- All calculator names and descriptions
- Input labels and result labels
- Navigation and interface text
- Help text and tooltips
- Number formatting (decimals, thousands separators)

### Dark/Light Mode

**Automatic:**
- Converty detects your system preference
- Automatically uses dark mode if your OS is in dark mode

**Manual Toggle:**
1. Click the theme toggle in the header
2. Choose Light, Dark, or System
3. Preference is saved in your browser

### Offline Support

Once you visit Converty online:

1. **Service Worker** caches the site
2. **Works offline** for previously visited pages
3. **Fast loading** on repeat visits
4. **Install as PWA** for full offline access

**Testing Offline Mode:**
1. Visit the website while online
2. Browse a few calculators
3. Turn off your internet
4. Refresh the page - it still works!

## Calculator Categories Deep Dive

### Photography Calculators

Perfect for photographers planning shots:

**Depth of Field Family:**
- **Depth of Field:** Basic DoF from aperture, focal length, distance
- **Advanced DoF:** Precise DoF with custom Circle of Confusion
- **Macro DoF:** DoF for macro photography using magnification ratio
- **DoF Table:** Compare DoF across apertures and distances
- **Hyperfocal Distance:** Maximize depth of field
- **Circle of Confusion:** Calculate CoC for your sensor/print size

**Exposure & Light:**
- **Light EV:** Calculate Exposure Value
- **ND Filter Calculator:** Calculate exposure with ND filters
- **Golden Hour:** Find sunrise/sunset times (uses your location)

**Astrophotography:**
- **Spot Stars (NPF Rule):** Max exposure before star trailing
- **Star Trails:** Calculate rotation for star trail photos

**Composition:**
- **Aspect Ratio:** Calculate and convert ratios
- **Aspect Fit:** Crop/letterbox calculations
- **Field of View:** Calculate from focal length
- **Portrait Distance:** Ideal shooting distance

**Resolution & Print:**
- **DPI Calculator:** Megapixels needed for print size
- **Image Filesize:** Estimate JPEG/PNG/RAW sizes
- **Time Lapse:** Plan intervalometer settings

**Example Use Case - Landscape Photography:**
```
1. Use Hyperfocal Distance calculator
   - Focal length: 24mm
   - Aperture: f/11
   - Sensor: Full Frame
   → Focus at 3.2m for maximum sharpness

2. Use Golden Hour calculator
   - Allow location access
   → Sunrise: 6:42 AM, Golden hour ends: 7:28 AM

3. Share the calculation with your photography buddy!
```

### Finance Calculators

Make informed financial decisions:

**Loans & Mortgages:**
- **Mortgage Calculator:** Monthly payments, total interest
- **Loan Calculator:** General loan amortization
- **Compound Interest:** Investment growth over time
- **Simple Interest:** Basic interest calculations

**Investment:**
- **ROI Calculator:** Return on investment
- **Stock Profit:** Calculate stock gains/losses
- **Dividend Yield:** Dividend-based returns
- **Break-Even Analysis:** Find profitability point

**Personal Finance:**
- **Savings Goal:** Plan for major purchases
- **Budget Calculator:** Track income vs expenses
- **Tax Calculator:** Estimate tax liability
- **Tip Calculator:** Restaurant tipping

**Currency & Conversion:**
- **Currency Converter:** Live exchange rates
- **Price Comparison:** Compare prices in different currencies

**Example Use Case - Home Buying:**
```
1. Mortgage Calculator
   - Loan amount: $400,000
   - Interest rate: 6.5%
   - Term: 30 years
   → Monthly payment: $2,528
   → Total interest: $510,096

2. Share with your partner to discuss budget
3. Bookmark to compare different scenarios
```

### Health & Fitness Calculators

Track your wellness journey:

**Body Metrics:**
- **BMI Calculator:** Body Mass Index
- **BMR Calculator:** Basal Metabolic Rate
- **Body Fat Percentage:** Estimate body composition
- **Ideal Weight:** Target weight ranges

**Nutrition:**
- **Calorie Calculator:** Daily calorie needs
- **Macro Calculator:** Protein/carbs/fat breakdown
- **Water Intake:** Hydration recommendations
- **Meal Planner:** Plan balanced meals

**Exercise:**
- **Heart Rate Zones:** Training zone calculator
- **Calories Burned:** Estimate exercise calories
- **Step Counter:** Activity tracking
- **Pace Calculator:** Running/cycling pace

**Example Use Case - Fitness Goal:**
```
1. BMI Calculator
   - Height: 175 cm
   - Weight: 85 kg
   → BMI: 27.8 (Overweight)

2. Ideal Weight Calculator
   → Target: 65-75 kg

3. Calorie Calculator
   - Age: 30, Gender: Male
   - Activity: Moderate
   → Daily calories: 2,450
   → Deficit for weight loss: 1,950

4. Track progress by bookmarking each calculation
```

### Web Development Calculators

Essential tools for developers:

- **URL Encoder/Decoder:** Encode special characters
- **HTML Entity Encoder:** Convert HTML entities
- **Base64 Encoder/Decoder:** Encode binary data
- **CSP Generator:** Create Content Security Policy headers
- **SEO Analyzer:** Check page optimization
- **Security Headers:** Validate HTTP security headers
- **Password Strength:** Test password complexity
- **Regex Tester:** Test regular expressions

### Network Calculators

For network administrators and IT professionals:

- **Subnet Calculator:** Calculate IP ranges, subnet masks
- **CIDR Calculator:** CIDR notation conversion
- **IP Address Calculator:** IPv4/IPv6 calculations
- **Network Speed:** Bandwidth calculations
- **Download Time:** Estimate file transfer time

### Video Production Calculators

Plan your video projects:

- **Video File Size:** Estimate storage needs
- **Bitrate Calculator:** Calculate required bitrate
- **Frame Rate Converter:** Convert between frame rates
- **Aspect Ratio:** Video dimensions and cropping
- **DCP Calculator:** Digital Cinema Package planning
- **Time Lapse:** Video from photo sequences
- **Screen Recording:** Calculate file sizes

## Tips & Tricks

### Power User Features

**1. Keyboard Shortcuts:**
- `Cmd+K` / `Ctrl+K` - Open search
- `Esc` - Close search
- `Tab` - Navigate between fields
- Arrow keys - Navigate search results

**2. URL Parameters:**
- Manually edit URL to change values
- Useful for scripting or automation
- Example: `?height=180&weight=75`

**3. Bookmarklets:**
- Bookmark calculations you use daily
- Example: "My Daily Calorie Needs"
- Click bookmark to load pre-filled calculator

**4. Multiple Windows:**
- Open multiple calculators in different tabs
- Compare results side-by-side
- Use split-screen for easy comparison

**5. Mobile Usage:**
- Add to home screen on iOS/Android
- Works offline after installation
- Full functionality on mobile devices

### Common Use Cases

**Student Studying Math:**
1. Search for "quadratic" → Quadratic Formula Calculator
2. Solve homework problems
3. Share solutions with study group via URL

**Real Estate Agent:**
1. Bookmark Mortgage Calculator with common loan terms
2. Show clients different scenarios in real-time
3. Send calculation links via email

**Photographer on Location:**
1. Install PWA on phone
2. Use DoF and Golden Hour calculators offline
3. Plan shots without internet connection

**Web Developer:**
1. Keep Converty open in separate browser window
2. Quick access to URL encoding, Base64, etc.
3. Copy results directly into code

**Fitness Enthusiast:**
1. Track BMI, BMR, calories weekly
2. Bookmark each calculation
3. Monitor progress over time

### Troubleshooting

**Calculator not updating:**
- Check that input values are valid numbers
- Some calculators require all fields to be filled
- Negative values may not be allowed in certain fields

**Language not changing:**
- Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+F5)
- Clear browser cache
- Check if you're using an incognito/private window

**URL sharing not working:**
- Ensure the full URL is copied
- Check that recipient is using the same version
- Some ad blockers may interfere with URL parameters

**Offline mode not working:**
- Visit the online version first
- Browse several pages to cache content
- Check browser service worker support
- iOS requires "Add to Home Screen" for full offline support

**PWA installation issues:**
- Use a supported browser (Chrome, Edge, Safari)
- Ensure you're on HTTPS (production site)
- Check browser permissions for installation

## Privacy & Security

### Data Handling

**What Converty Does NOT Do:**
- ❌ Store your calculations on servers
- ❌ Track your personal data
- ❌ Require account creation
- ❌ Use cookies for tracking
- ❌ Send data to third parties

**What Converty DOES Do:**
- ✅ All calculations run in your browser (client-side)
- ✅ URL state is optional and in your control
- ✅ PWA caches files locally on your device
- ✅ Open source - code is publicly auditable
- ✅ No analytics or tracking scripts

### Location Services

**Golden Hour Calculator:**
- Requests browser geolocation permission
- Only used for sun calculation
- Never stored or transmitted
- You can manually enter coordinates instead

**Network Requests:**
- Cryptocurrency prices (if using crypto calculators)
- Currency exchange rates (if using currency converter)
- No other external API calls

## Frequently Asked Questions

### General Questions

**Q: Is Converty free to use?**
A: Yes! Converty is completely free and open source under the MIT License.

**Q: Do I need to create an account?**
A: No. All calculators work without any registration or login.

**Q: Can I use Converty offline?**
A: Yes! Install the PWA or download the offline package.

**Q: Is my data private?**
A: Yes. All calculations run in your browser. Nothing is sent to servers (except optional API calls for crypto/currency rates).

**Q: How often is Converty updated?**
A: Regular updates with new calculators and improvements. Check the [GitHub repository](https://github.com/fjacquet/converty) for release notes.

### Calculator Questions

**Q: Why don't I see a "Calculate" button?**
A: Results update automatically as you type! No button is needed.

**Q: Can I save my calculations?**
A: Bookmark the URL - it contains all your input values.

**Q: How accurate are the calculations?**
A: Calculations use industry-standard formulas. Financial calculators are for estimation only - consult a professional for actual financial decisions.

**Q: Can I suggest a new calculator?**
A: Yes! Open an issue on [GitHub](https://github.com/fjacquet/converty/issues) or contribute via pull request.

**Q: What's the precision of number calculations?**
A: JavaScript floating-point precision (typically 15-17 decimal digits). Financial calculations use appropriate rounding.

### Technical Questions

**Q: What browsers are supported?**
A: All modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).

**Q: Can I embed Converty calculators on my website?**
A: Converty is designed as a standalone site. For embedding, you'd need to fork the repository and extract specific calculators.

**Q: Is there an API?**
A: No external API. All calculation functions are in the source code and can be imported if you're building a custom application.

**Q: Can I run Converty on my own server?**
A: Yes! It's a static site. Clone the repository, run `npm run build`, and host the `out` directory.

**Q: Mobile app available?**
A: Install as a PWA for an app-like experience. Native iOS/Android apps are not currently planned.

## Getting Help

### Support Resources

**Documentation:**
- [User Guide](https://github.com/fjacquet/converty/blob/main/docs/USER_GUIDE.md) (this document)
- [README](https://github.com/fjacquet/converty/blob/main/README.md)
- [Contributing Guide](https://github.com/fjacquet/converty/blob/main/CONTRIBUTING.md)

**Report Issues:**
- [GitHub Issues](https://github.com/fjacquet/converty/issues)
- Include calculator name and browser version
- Describe what you expected vs what happened
- Screenshots are helpful!

**Feature Requests:**
- [GitHub Issues](https://github.com/fjacquet/converty/issues)
- Tag with "enhancement"
- Describe the use case
- Check if already requested

**Contributing:**
- Pull requests are welcome!
- See [CONTRIBUTING.md](https://github.com/fjacquet/converty/blob/main/CONTRIBUTING.md)
- Developer docs in [docs/CALCULATOR_GUIDE.md](https://github.com/fjacquet/converty/blob/main/docs/CALCULATOR_GUIDE.md)

## What's Next?

### Explore More

Now that you know how to use Converty, explore these popular calculators:

**For Everyone:**
- BMI Calculator - Track your health
- Tip Calculator - Quick restaurant calculations
- Age Calculator - Calculate exact age
- Currency Converter - Live exchange rates

**For Professionals:**
- Subnet Calculator - Network planning
- Mortgage Calculator - Home financing
- DoF Calculator - Photography planning
- Bitrate Calculator - Video production

**For Students:**
- Quadratic Formula - Algebra homework
- Percentage Calculator - Quick math
- Triangle Calculator - Geometry
- Unit Converter - Physics problems

### Stay Updated

- ⭐ Star the [GitHub repository](https://github.com/fjacquet/converty)
- 👀 Watch for new releases
- 🐛 Report bugs to help improve Converty
- 💡 Suggest new calculators

---

**Happy Calculating!** 🎉

If you find Converty useful, please consider:
- Sharing it with friends and colleagues
- Starring the GitHub repository
- Contributing new calculators
- Reporting bugs or suggesting improvements

*Last updated: 2026-01-31*
*Version: 5.0*
