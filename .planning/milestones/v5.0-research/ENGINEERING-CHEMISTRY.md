# Engineering & Chemistry Features Research

**Researched:** 2026-01-27
**Domain:** Engineering & CAD, Chemistry & Science calculator features
**Platform:** Converty (172+ existing calculators, Next.js 16, static export)

## Engineering & CAD Calculators

### Table Stakes (Core value for engineers)

**Structural Analysis:**

- **Beam stress & deflection calculator** - Calculate bending stress (σ = M × c / I), shear force, and deflection for simply supported, cantilever, and fixed beams. Engineers use this daily for sizing structural members.
- **Moment of inertia & section modulus** - Calculate geometric properties (Ix, Iy, Zx, Zy) for standard sections (I-beam, T-beam, channel, angle, rectangular, circular). Critical for structural design.
- **Column design calculator** - Determine axial load capacity, buckling resistance, and shear forces for columns under vertical and lateral loads. Foundation of structural safety.

**Material Properties:**

- **Material database integration** - Quick access to properties (Young's modulus, yield strength, density, Poisson's ratio) for steel, aluminum, concrete, timber. Engineers need this multiple times per day to avoid looking up reference books.
- **Unit conversion with precision** - Convert between SI and imperial units (MPa ↔ psi, mm ↔ inches, kN ↔ lbf) with 10-12 digit precision. Unit errors have caused $125M spacecraft failures and structural collapses.

**Hydraulics & Thermodynamics:**

- **Pipe flow & pressure drop** - Calculate pressure drop using Darcy-Weisbach equation, accounting for pipe roughness, Reynolds number, and flow regime (laminar vs turbulent). Essential for HVAC and piping design.
- **Heat transfer calculator** - Conduction, convection, and radiation calculations using Fourier's law, Newton's law of cooling, Stefan-Boltzmann equation. Used in thermal design and HVAC systems.

**Why these matter:**
These calculations form 80% of daily engineering work. Without them, engineers manually calculate or use Excel, which is error-prone and slow. Web calculators provide instant validation and reduce calculation errors.

### Differentiators (Competitive advantage)

**Visual Outputs:**

- **Shear force & bending moment diagrams** - Generate SVG diagrams showing how forces vary along beam length. Most calculators only show numbers; visual diagrams help engineers validate results intuitively.
- **Load case visualization** - Show applied loads, reactions, and support conditions graphically. Makes complex loading scenarios easier to understand.

**Integration Features:**

- **Standard section library** - Pre-loaded database of common steel sections (W-shapes, C-channels, angles) with dimensions and properties. Saves engineers from manual data entry.
- **Code compliance indicators** - Reference to design codes (ACI 318 for concrete, AISC 360 for steel, Eurocode) with formula citations. Helps engineers justify calculations in reports.
- **Step-by-step calculation display** - Show intermediate steps with formula references (e.g., "Calculate Ix using parallel axis theorem: Ix = Ic + Ad²"). Educational and builds trust in results.

**Export & Sharing:**

- **PDF calculation reports** - Generate professional reports with inputs, formulas, results, and diagrams. Engineers need documentation for project files and regulatory approval.
- **CSV data export** - Export results for further analysis in Excel/Python. Fits into existing engineering workflows.

**Why users choose this over alternatives:**
Desktop software (AutoCAD, SAP2000) is overkill for simple calculations and requires licensing. Excel is manual and error-prone. Web calculators that combine speed, visualization, and documentation fill the gap between "too simple" spreadsheets and "too complex" engineering software.

### Anti-Features (What NOT to build)

**Scope Creep:**

- **Full CAD drawing tools** - Drawing beams and structures sounds useful but requires massive complexity (snap-to-grid, layers, dimensioning). Users already have CAD software for this. Focus on calculations, not drafting.
- **3D visualization** - Rotating 3D models of beams/structures adds visual appeal but limited practical value. Engineers work from 2D plans. 3D requires WebGL/Three.js, increasing bundle size and complexity.

**Beyond Static Export Capabilities:**

- **Finite Element Analysis (FEA)** - Solving partial differential equations for stress distribution requires iterative computation unsuitable for client-side JavaScript. Engineers use specialized desktop software (ANSYS, Abaqus) for this.
- **Multi-member frame analysis** - Analyzing entire building frames with multiple beams/columns requires matrix methods and significant computation. Too complex for web calculators; users expect desktop software for this.

**Feature Bloat:**

- **Database-heavy features requiring login** - Saving custom material libraries, project history, or user preferences requires backend infrastructure, contradicting Converty's static export architecture. Keep calculators stateless.
- **Complex workflow builders** - Multi-step design wizards that guide users through entire design processes add complexity without proportional value. Engineers prefer focused, single-purpose calculators.

**Why explicitly excluding:**
Research shows engineers value speed and focus over comprehensive features. The Mars Climate Orbiter failure and Hyundai crane collapse highlight that complexity breeds errors. Simple, focused calculators with clear outputs reduce cognitive load and calculation mistakes. Feature bloat leads to customer churn and technical debt.

### Complexity Notes

**High Complexity / High Risk:**

- **Beam deflection with variable loads** - Requires numerical integration for non-uniform distributed loads. Analytical solutions only exist for simple load cases.
- **Buckling calculations** - Euler buckling is straightforward, but real-world buckling (effective length factors, lateral-torsional buckling) involves empirical factors from design codes that vary by jurisdiction.
- **Reynolds number & friction factor** - Turbulent flow requires iterative solution of Colebrook-White equation or approximation methods (Swamee-Jain). Not complex algorithmically but easy to implement incorrectly.

**Medium Complexity:**

- **Moment of inertia for composite shapes** - Parallel axis theorem is simple, but UI for defining multiple rectangles/circles and combining them requires careful design.
- **Material database** - Storing 1800+ materials (steel, aluminum, concrete, timber grades) with multiple properties requires structured data. Not algorithmically complex but data management overhead.

**Low Complexity:**

- **Simple beam formulas** - Standard equations for cantilever, simply supported, fixed beams with point loads or uniform distributed loads.
- **Unit conversions** - Multiplication by conversion factors with precision handling.
- **Basic thermodynamics** - Heat transfer equations are algebraic rearrangements.

**Risk Areas:**

- **Formula errors** - Engineering formulas must be correct; errors could lead to unsafe designs. Requires verification against textbook examples and code references.
- **Unit consistency** - Mixing SI and imperial units can cause catastrophic errors (Mars Climate Orbiter). All calculations must maintain unit consistency internally.
- **Precision display** - Engineers expect scientific notation and appropriate significant figures. Displaying "123456.789123 MPa" instead of "1.235e5 MPa" looks unprofessional.

### Expected User Workflows

**Structural Engineer designing a steel beam:**

1. Navigate to "Beam Stress Calculator"
2. Select beam type (simply supported) and loading (uniform distributed + point load)
3. Input span length (6000 mm), loads (10 kN/m, 50 kN at midspan)
4. Select material from database (ASTM A36 steel) → auto-fills Young's modulus, yield strength
5. Choose section from library (W310×52) → auto-fills Ix, Zx, section dimensions
6. View results: max stress, max deflection, safety factor, reactions
7. See shear force diagram and bending moment diagram
8. Export PDF report for project documentation
9. Share URL with colleague for review

**Mechanical Engineer calculating pipe pressure drop:**

1. Navigate to "Pipe Flow Calculator"
2. Input pipe diameter (100 mm), length (500 m), flow rate (50 L/s)
3. Select fluid (water at 20°C) → auto-fills density, viscosity
4. Select pipe material (commercial steel) → auto-fills roughness (0.045 mm)
5. Calculator determines Reynolds number (turbulent), friction factor (iteratively)
6. View results: pressure drop (127 kPa), head loss (13 m), flow velocity (6.4 m/s)
7. Export CSV with intermediate calculations for verification

**Civil Engineer checking column capacity:**

1. Navigate to "Column Design Calculator"
2. Select code (ACI 318-19 or Eurocode 2)
3. Input column dimensions (400×400 mm), height (4000 mm)
4. Input loads: axial (1500 kN), moment (200 kN⋅m)
5. View capacity check: utilization ratio, buckling check, shear check
6. See step-by-step calculations with code references
7. Save URL to project notes

**Key patterns:**

- **Quick reference over comprehensive design** - Engineers know what they need to calculate; they want fast results, not design guidance.
- **Validation, not creation** - Engineers design in CAD/Excel, then use web calculators to validate assumptions.
- **Documentation matters** - Results must be exportable for project files and regulatory submissions.
- **Mobile use in field** - Checking calculations on-site or in meetings requires mobile-friendly interface.

---

## Chemistry & Science Calculators

### Table Stakes (Core value for scientists)

**Solution Preparation:**

- **Molarity calculator** - Calculate molarity (M = moles/L), mass, volume, or molecular weight. Used daily in every chemistry lab for solution preparation.
- **Dilution calculator (M1V1=M2V2)** - Calculate volumes for diluting stock solutions to working concentrations. Most common calculation in wet labs.
- **Serial dilution calculator** - Generate dilution series for calibration curves and standard preparations. Essential for analytical chemistry and biochemistry.

**Stoichiometry:**

- **Molar mass calculator** - Calculate molecular weight from chemical formula (e.g., "H2SO4" → 98.08 g/mol). Used constantly, tedious to calculate manually.
- **Limiting reagent calculator** - Determine which reactant limits product formation and calculate theoretical yield. Core to synthetic chemistry.
- **Stoichiometry calculator** - Convert between moles, mass, and volume using balanced equations. Fundamental to quantitative chemistry.

**pH & Acid-Base:**

- **pH calculator** - Calculate pH from concentration, pOH from pH, [H+] and [OH-] relationships. Used in buffer preparation and analytical chemistry.
- **Buffer calculator** - Calculate buffer pH using Henderson-Hasselbalch equation. Critical for biochemistry and molecular biology.

**Concentration Conversions:**

- **Multi-unit conversion** - Convert between molarity (M), percent (%, w/v, v/v), ppm, ppb, mg/mL, µg/mL. Different fields use different units; conversion is constant friction.

**Reference Data:**

- **Fundamental constants** - Avogadro's number (6.02214076×10²³ mol⁻¹), gas constant R (8.314 J⋅K⁻¹⋅mol⁻¹), Boltzmann constant. Students and professionals look these up constantly.
- **Periodic table integration** - Atomic masses, atomic numbers, element symbols. Required for molar mass calculations and stoichiometry.

**Why these matter:**
Laboratory work involves repetitive calculations (dilution, molarity, pH) that interrupt experimental flow. Errors in dilution or limiting reagent calculations waste expensive materials and days of work. Mobile-friendly calculators in the lab reduce errors and speed up workflows.

### Differentiators (Competitive advantage)

**Intelligent Parsing:**

- **Chemical formula parser** - Accept complex formulas like "Ca(NO3)2⋅4H2O" or "Fe2(SO4)3" and automatically calculate molar mass by parsing parentheses, subscripts, and hydration. Most calculators require manual element-by-element entry.
- **Multi-format input** - Accept "0.1 M", "100 mM", "100 millimolar" interchangeably. Natural language reduces friction.

**Integrated Reference Data:**

- **Searchable periodic table** - Click element to see atomic mass, number, electron configuration. Integrated workflow instead of switching between calculator and reference table.
- **Isotope data** - Provide isotopic masses for applications requiring precise calculations (mass spectrometry, radiochemistry).
- **Common chemicals database** - Pre-populate formulas for frequently used compounds (NaCl, H2SO4, NaOH, CaCl2). Saves typing and reduces errors.

**Workflow Features:**

- **Solution preparation recipes** - Output step-by-step instructions: "Weigh 4.9 g NaOH. Add to 800 mL water. Mix. Adjust to 1000 mL." Bridges calculation to bench work.
- **Concentration unit flexibility** - Allow input/output in any unit combination (input: 50 mg/mL, output: 0.85 M). Different fields prefer different units; flexibility reduces friction.

**Quality Indicators:**

- **Significant figures handling** - Respect sig figs in inputs and display results appropriately (not "5.12345678 M" when input was "5 g").
- **Purity correction** - Account for chemical purity (e.g., "NaOH, 98% pure" → adjust mass calculation). Real-world chemicals aren't 100% pure.

**Why users choose this over alternatives:**
Physical calculators lack chemical formula parsing. Excel requires manual lookup of atomic masses and formula parsing. Desktop chemistry software (ChemDraw) is overkill for simple calculations. Web calculators that parse formulas, integrate periodic table data, and output preparation recipes fit lab workflows perfectly.

### Anti-Features (What NOT to build)

**Scope Creep:**

- **Equation balancing** - Balancing chemical equations (e.g., "Fe + O2 → Fe2O3") requires solving linear algebra or trial-and-error algorithms. Complex implementation, limited practical value (most chemists balance equations mentally or use textbooks).
- **3D molecular visualization** - Rendering ball-and-stick or space-filling models requires molecular geometry calculation and WebGL rendering. Visually appealing but rarely needed for calculations; specialized tools (Avogadro, PyMOL) handle this better.
- **Reaction prediction** - Predicting products from reactants requires extensive chemical knowledge databases and ML models. Unreliable, complex, and beyond scope of calculators.

**Database Bloat:**

- **Comprehensive chemical database** - Storing properties (boiling point, density, solubility) for 100,000+ chemicals creates massive data files unsuitable for static export. Focus on calculations, not encyclopedic data.
- **Spectroscopy analysis** - IR, NMR, or mass spec analysis requires signal processing and pattern matching. Specialized software domain; doesn't fit calculator paradigm.

**Complex Features:**

- **Multi-step synthesis planning** - Planning reaction sequences for organic synthesis requires retrosynthetic analysis and expert knowledge. Desktop software (ChemDraw, Reaxys) handles this; web calculators should focus on individual calculations.
- **Thermodynamic calculations** - Gibbs free energy, entropy, enthalpy changes require extensive thermodynamic databases. Too data-heavy for static web app.

**Why explicitly excluding:**
Chemistry calculators should solve immediate lab needs (dilution, molarity, pH), not replace specialized chemistry software. Feature bloat creates complex UIs that slow down simple tasks. The "Periodic Table: Chemistry 2026" app has 15M+ downloads with 4.7 rating by focusing on core features (periodic table, molar mass, formula parsing) rather than attempting comprehensive chemistry coverage.

### Complexity Notes

**High Complexity / High Risk:**

- **Chemical formula parsing** - Handling nested parentheses, brackets, hydration (e.g., "Mg3(PO4)2⋅8H2O"), and edge cases requires robust parser. High value but implementation complexity.
- **pH of polyprotic acids/bases** - Calculating pH for compounds with multiple ionizable groups (H3PO4, amino acids) requires solving systems of equations iteratively. Much more complex than simple pH calculations.
- **Buffer capacity calculations** - Beyond Henderson-Hasselbalch, calculating how much acid/base a buffer can neutralize requires integration over titration curve.

**Medium Complexity:**

- **Stoichiometry with multiple reactants** - Identifying limiting reagent and calculating excess reactants requires comparing mole ratios. Not algorithmically hard but requires careful implementation.
- **Serial dilution with variable factors** - Generating dilution series with changing dilution factors (e.g., 1:2, 1:5, 1:10 progression) requires flexible algorithm.
- **Concentration unit conversions** - Converting between molarity, percent, ppm, mg/mL requires molecular weight and density. Units must be tracked carefully.

**Low Complexity:**

- **Simple dilution (M1V1=M2V2)** - Algebraic rearrangement of one equation.
- **Molar mass from formula** - Sum atomic masses (once formula is parsed).
- **pH from [H+] or vice versa** - Logarithmic relationship (pH = -log[H+]).
- **Avogadro conversions** - Multiplication by 6.022×10²³.

**Risk Areas:**

- **Formula parsing errors** - Misinterpreting "Ca(OH)2" as "Ca(O)H2" or "CaOH2" yields wrong molar mass. Parsing must be robust and tested extensively.
- **Unit confusion** - Chemistry uses many overlapping units (M, mM, µM, mg/mL, µg/mL, %, ppm). Clear labeling and validation essential.
- **Precision for trace analysis** - Some applications (analytical chemistry, pharmaceuticals) require high precision. Using `parseFloat` instead of arbitrary precision libraries can introduce errors.

### Expected User Workflows

**Biochemistry lab preparing buffer:**

1. Navigate to "Buffer Calculator (Henderson-Hasselbalch)"
2. Select buffer system (Tris-HCl, PBS, acetate) from presets or enter pKa manually
3. Input desired pH (7.4), volume (500 mL), concentration (50 mM)
4. View recipe: "Weigh 3.03 g Tris base. Dissolve in 400 mL water. Adjust pH to 7.4 with HCl. Bring to 500 mL."
5. See ratios of acid/base components
6. Export recipe as PDF for lab notebook

**Analytical chemist preparing calibration standards:**

1. Navigate to "Serial Dilution Calculator"
2. Input stock concentration (1000 ppm), dilution factor (1:10)
3. Input number of dilutions (5), final volume (100 mL each)
4. View dilution table: 1000 ppm → 100 ppm → 10 ppm → 1 ppm → 0.1 ppm
5. See transfer volumes: "Add 10 mL stock to 90 mL diluent for each step"
6. Export CSV for LIMS documentation

**Organic chemistry student calculating limiting reagent:**

1. Navigate to "Limiting Reagent Calculator"
2. Enter balanced equation: "2 Al + 3 CuCl2 → 2 AlCl3 + 3 Cu"
   - Or select from common reactions (oxidation, esterification, etc.)
3. Input Al: 5.0 g available
4. Input CuCl2: 15.0 g available
5. Calculator parses formulas, calculates molar masses (Al: 26.98 g/mol, CuCl2: 134.45 g/mol)
6. View results: CuCl2 is limiting reagent, Al in excess (1.5 g remaining)
7. Theoretical yield: 14.9 g AlCl3, 10.6 g Cu
8. See step-by-step stoichiometry calculations

**Research scientist diluting stock solution:**

1. Navigate to "Dilution Calculator"
2. Input stock: 5 M HCl
3. Input desired: 0.1 M, 250 mL
4. View result: "Add 5.0 mL stock to 245 mL water"
5. See warning: "Always add acid to water, never water to acid"
6. Copy URL to lab notebook for reproducibility

**Key patterns:**

- **Quick calculations between experiments** - Scientists at the bench need instant answers without navigating complex UIs.
- **Formula parsing reduces errors** - Typing "NaCl" vs manually entering "Na: 1, Cl: 1" is faster and less error-prone.
- **Mobile use in lab** - Phones and tablets are more practical than laptops in wet lab environments (splash-resistant, portable).
- **Documentation for reproducibility** - Export to PDF or save URL for lab notebooks and methods sections in papers.

---

## Cross-Domain Insights

### Shared Patterns

**Reference Data Integration:**
Both domains require quick access to reference data:

- Engineering: Material properties (E, σy, ρ), standard sections (I-beams, channels)
- Chemistry: Periodic table (atomic masses), constants (NA, R, kB), common chemicals

**Implication:** Build reusable reference data components. Searchable tables with filter/sort that can be embedded in calculators.

**Unit Conversion is Critical:**
Both domains suffer from unit confusion:

- Engineering: SI ↔ Imperial errors caused $125M Mars orbiter loss and Hyundai crane collapse
- Chemistry: Molarity ↔ % ↔ ppm ↔ mg/mL conversions constant source of errors

**Implication:** Every calculator must handle multiple unit systems with clear labeling. Display input units alongside output. Provide unit conversion as standalone calculators.

**Precision & Scientific Notation:**
Both domains require appropriate precision:

- Engineering: 10-12 digit precision, scientific notation for large/small values (1.23e5 MPa)
- Chemistry: Significant figures matter, scientific notation for Avogadro's number (6.022e23)

**Implication:** Use arbitrary precision libraries where needed. Display results in scientific notation when appropriate. Allow user-configurable significant figures.

**Step-by-Step Transparency:**
Both domains value seeing calculation logic:

- Engineering: Show formulas with code references (ACI 318-19, AISC 360-16)
- Chemistry: Show stoichiometry steps, unit conversions, intermediate calculations

**Implication:** Build collapsible "Show calculations" sections displaying formulas, intermediate steps, and references. Builds trust and educational value.

**Export for Documentation:**
Both domains require records:

- Engineering: Project files, regulatory submissions, client reports
- Chemistry: Lab notebooks, methods sections, reproducibility

**Implication:** Leverage existing Converty PDF export. Consider CSV for data export. URL state sharing for reproducibility.

### Differentiation from Existing Categories

**More Specialized Than Existing Math:**
Converty has 38 math calculators, but engineering and chemistry need domain-specific calculations:

- Not just "percentage" but "strain from stress and Young's modulus"
- Not just "ratio" but "stoichiometric mole ratios from balanced equations"

**More Professional Than Consumer Tools:**
Existing categories (Cooking, Automotive) target general consumers. Engineering and Chemistry target professionals:

- Higher precision requirements
- Regulatory compliance (building codes, lab standards)
- Professional documentation outputs
- Mobile use in field/lab environments

**Complementary to Physics:**
Converty has 1 physics calculator. Engineering and Chemistry expand physics into applied domains:

- Physics: F = ma
- Engineering: Stress-strain relationships, beam deflection, heat transfer
- Chemistry: Gas laws applied to solution preparation

### Integration Opportunities

**Leverage Existing Infrastructure:**

- **URL state sync** - Already implemented; perfect for sharing calculations with colleagues
- **i18n (en/fr/de/it)** - Switzerland and Europe focus aligns with existing translations
- **PDF/CSV export** - Existing export functionality fits documentation needs
- **Zustand stores** - Calculator state management pattern already established

**New Components to Build:**

- **Formula parser** - Chemistry formulas (reusable for chemical equations across calculators)
- **Scientific notation display** - Format numbers as "1.23×10⁵" with proper superscripts
- **Reference data tables** - Searchable material database, periodic table, constants
- **Diagram renderers** - SVG shear force diagrams, bending moment diagrams (engineering)
- **Unit system selector** - Global preference for SI vs Imperial (engineering)

**Data Requirements:**

- **Material properties database** - JSON file with 200-500 common materials (steel, aluminum, concrete grades)
- **Periodic table data** - JSON with atomic masses, numbers, symbols (118 elements)
- **Standard sections library** - JSON with W-shapes, channels, angles dimensions and properties (500-1000 sections)
- **Common chemicals** - JSON with frequent formulas (NaCl, H2SO4, NaOH, etc.) for autocomplete

**Validation Strategy:**

- **Engineering formulas** - Verify against textbook examples (Mechanics of Materials by Beer & Johnston, Structural Analysis by Hibbeler)
- **Chemistry calculations** - Verify against known stoichiometry problems, published solution prep protocols
- **Unit conversions** - Cross-check with NIST standards
- **Code compliance** - Reference official codes (ACI 318, AISC 360, Eurocode)

### Complexity Management

**Start Simple, Add Complexity Incrementally:**

**Phase 1 (MVP) - Low Complexity, High Value:**

- Simple beam calculator (cantilever, simply supported, point load, UDL)
- Molarity and dilution calculators
- Molar mass calculator with formula parser
- Unit converters (pressure, force, concentration)
- Periodic table reference

**Phase 2 - Medium Complexity:**

- Moment of inertia for standard sections
- Serial dilution calculator
- Limiting reagent calculator
- Pipe flow / pressure drop
- pH calculator

**Phase 3 - Higher Complexity:**

- Custom section moment of inertia (composite shapes)
- Visual diagrams (shear force, bending moment)
- Buffer calculator (Henderson-Hasselbalch)
- Heat transfer calculator
- Column design with code compliance

**Defer Indefinitely (Anti-Features):**

- FEA and multi-member analysis
- Equation balancing and reaction prediction
- 3D visualization
- Comprehensive chemical/material databases

**Risk Mitigation:**
Both domains have regulatory and safety implications:

- Engineering calculations inform building/structure design (safety-critical)
- Chemistry calculations inform solution preparation (safety-critical)

**Approach:**

1. Display prominent disclaimer: "For educational/reference purposes. Verify results with professional engineer/chemist before critical applications."
2. Show formulas and assumptions clearly
3. Link to authoritative sources (codes, standards)
4. Validate against published examples extensively
5. Unit tests with known good results from textbooks

### Market Fit

**Target Users:**

- **Engineering:** Structural engineers, mechanical engineers, civil engineers, engineering students
- **Chemistry:** Research chemists, analytical chemists, biochemists, chemistry students
- **Geography:** Switzerland, Europe (aligns with Converty's existing i18n)

**Competitive Landscape:**

- **Existing:** MechaniCalc, SkyCiv, EngineersEdge (engineering); ChemicalAid, MolBioTools (chemistry)
- **Differentiation:** Converty's multi-domain platform, i18n, clean UI, mobile-first design, URL sharing
- **Gaps:** Most existing tools are single-domain. Converty's cross-domain platform (Math + Finance + Health + Engineering + Chemistry) is unique.

**Value Proposition:**

- **For professionals:** Fast validation calculations without opening desktop software
- **For students:** Educational tool showing step-by-step calculations
- **For teams:** URL sharing for collaborative review
- **For mobile users:** Lab/field calculations on phones/tablets

---

## Sources

**Engineering Calculators & Tools:**

- [MechaniCalc](https://mechanicalc.com/calculators/) - Mechanical engineering calculators
- [SkyCiv Free Beam Calculator](https://skyciv.com/free-beam-calculator/) - Beam analysis with diagrams
- [SkyCiv Column Calculator](https://skyciv.com/quick-calculators/column-calculator/) - Column design
- [ClearCalcs](https://www.clearcalcs.com/) - Structural engineering calculations
- [StrengthOfMaterials.online](https://strengthofmaterials.online/) - 25 free tools for stress, beam, torsion, buckling
- [EngineersEdge Beam Calculator](https://www.engineersedge.com/beam_calc_menu.shtml) - Beam stress & deflection formulas
- [CalcForge](https://calcforge.com/) - Open source civil/mechanical/electrical calculators

**Engineering Workflows & Standards:**

- [The Structural Engineer Info](https://www.thestructuralengineer.info/education/professional-examinations-preparation/calculation-examples/calculation-example-shear-force) - Calculation examples for shear force
- [NIST Metrication Errors](https://www.nist.gov/pml/owm/metrication-errors-and-mishaps) - Unit conversion disasters
- [FSI Unit Conversions](https://www.fiberopticsystems.com/the-importance-of-accurate-unit-conversions-in-engineering) - Importance of accurate conversions
- [Everyeng Unit Disasters](https://www.everyeng.com/blog/cfb74622) - Real-world unit conversion failures

**Hydraulics & Thermodynamics:**

- [EngineersEdge Pressure Drop](https://www.engineersedge.com/fluid_flow/pressure_drop/pressure_drop.htm) - Pipe flow calculations
- [PipeFlow.com](https://www.pipeflow.com/pipe-pressure-drop-calculations) - Pressure drop formulas
- [HydrauCalc](https://www.hydraucalc.com/) - Free fluid flow calculator
- [ThermoFluidCalc](http://thermofluidcalc.com/) - Heat transfer & thermodynamics calculator
- [Engineering ToolBox](https://www.engineeringtoolbox.com/) - Comprehensive engineering data

**Material Properties:**

- [MakeItFrom Material Database](https://www.makeitfrom.com/) - Material properties comparison
- [MatWeb](https://matweb.com/) - Online materials database
- [BeamDimensions Materials](https://beamdimensions.com/) - 1800+ material properties
- [MechaniCalc Material Tables](https://mechanicalc.com/reference/material-properties-tables) - Common engineering materials

**Moment of Inertia:**

- [SkyCiv Moment of Inertia Calculator](https://skyciv.com/free-moment-of-inertia-calculator/) - Centroid and I calculator
- [CalcForge MOI Calculator](https://calcforge.com/free-moment-of-inertia-calculator) - Free moment of inertia tool
- [OmniCalculator Section Modulus](https://www.omnicalculator.com/physics/section-modulus) - Section properties
- [Johannes Strommer Calculator](https://www.johannes-strommer.com/en/calculators/area-moment-of-inertia-and-section-modulus/) - Area moment formulas

**Chemistry Calculators:**

- [Sigma-Aldrich Molarity Calculator](https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/molarity-calculator) - Molarity and normality
- [Sigma-Aldrich Dilution Calculator](https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/solution-dilution-calculator) - Solution dilution
- [MolarityCalculator.net](https://molaritycalculator.net/) - Free chemistry calculators (101+ tools)
- [PhysiologyWeb Dilution](https://www.physiologyweb.com/calculators/dilution_calculator_molarity_percent.html) - Molarity/percent dilution
- [Sensorex pH Calculator](https://sensorex.com/ph-calculator/) - pH calculation tool
- [MolBioTools Chemical Calculator](https://molbiotools.com/chemicalcalculator.php) - Molarity, dilution, absorbance

**Stoichiometry:**

- [ChemicalAid Stoichiometry](https://www.chemicalaid.com/tools/reactionstoichiometry.php?hl=en) - Reaction stoichiometry calculator
- [ChemicalAid Limiting Reagent](https://www.chemicalaid.com/tools/limitingreagent.php?hl=en) - Limiting reactant calculator
- [ThermoBook Stoichiometry](http://thermobook.net/stoichiometry/) - Comprehensive reaction calculator
- [ChemBuddy EBAS](https://www.chembuddy.com/EBAS-stoichiometry-calculator) - Equation balancing & stoichiometry

**Periodic Table & Constants:**

- [Periodic Table Chemistry 2026 App](https://apps.apple.com/us/app/periodic-table-chemistry-2026/id1451726577) - Mobile app (15M+ downloads)
- [EniG Periodni](https://www.periodni.com/) - Periodic table with calculators
- [AP Chemistry 2026 Formula Sheet](https://www.apreviewbook.com/ap-chemistry-formula-sheet/) - Equations, constants, periodic table
- [Wikipedia Gas Constant](https://en.wikipedia.org/wiki/Gas_constant) - R = 8.314 J⋅K⁻¹⋅mol⁻¹
- [Wikipedia Avogadro Constant](https://en.wikipedia.org/wiki/Avogadro_constant) - NA = 6.02214076×10²³ mol⁻¹

**Molar Mass Tools:**

- [ThisPeriodicTable.com](https://www.thisperiodictable.com/) - Periodic table with molar mass calculator
- [EniG Molar Mass Calculator](https://www.periodni.com/molar_mass_calculator.php) - Chemical formula parser
- [EnvironmentalChemistry.com Molar](https://environmentalchemistry.com/yogi/reference/molar.html) - Molecular weight calculator
- [PlanetCalc Molar Mass](https://planetcalc.com/329/) - Online molar mass calculator
- [WebQC Molar Mass](https://www.webqc.org/mmcalc.php) - Elemental composition calculator

**Serial Dilution:**

- [Tocris Dilution Calculator](https://www.tocris.com/resources/dilution-calculator) - Serial dilution tool
- [Wolfram Alpha Dilution](https://www.wolframalpha.com/calculators/dilution-calculator) - Chemistry solver
- [Creative Diagnostics Concentration](https://www.creative-diagnostics.com/concentration-calculator.htm) - Concentration conversions

**Software Comparison:**

- [The Provato Group Web Apps](https://www.theprovatogroup.com/applications/why-choose-web-applications/) - Web vs desktop advantages
- [StyleTech Web vs Desktop](https://www.styletech.co.uk/blogs/web-apps-vs-desktop-apps-choosing-the-right-fit) - Choosing the right platform
- [EchoInnovate Comparative Guide](https://echoinnovateit.com/web-application-vs-desktop-application-a-comparative-guide/) - Pros/cons overview
- [ClickySoft Web Applications](https://clickysoft.com/advantages-and-disadvantages-of-web-applications/) - Advantages & disadvantages
- [Userpilot Feature Bloat](https://userpilot.com/blog/feature-bloat/) - What is feature bloat and how to avoid it
