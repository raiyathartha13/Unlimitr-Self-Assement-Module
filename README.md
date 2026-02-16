# Unlimitr AI Health Assessment Platform

A premium health intelligence platform that provides AI-structured metabolic and behavioral analysis based on user-submitted health signals. The platform features a sophisticated dashboard with real-time visualizations, trajectory simulations, and personalized health insights.

## 🎯 Overview

This platform combines advanced health scoring algorithms with an elegant, conversion-optimized user interface. The main dashboard (`journey-advanced.html`) provides a comprehensive "Health Intelligence Command Center" that delivers instant, authoritative insights without fake loaders or generic Bootstrap styling.

## ✨ Key Features

### Premium Dashboard (`journey-advanced.html`)
- **Authority Header**: Dynamic narrative with premium semi-radial arc gauge
- **Core System Drivers**: 6-card grid showing metabolic efficiency, recovery load, hormonal regulation, insulin sensitivity, movement output, and behavioral stability
- **Biological Impact Map**: Interactive SVG human silhouette with region highlighting
- **Trajectory Simulation**: Dual-path visualization (with/without intervention) using smooth Bezier curves
- **Consistency Risk Forecast**: 12-week risk prediction heatmap
- **Strategic Roadmap**: Animated timeline with milestone tracking
- **Conversion-Optimized CTA**: Premium conversion block with clear messaging

### Technical Highlights
- Pure SVG visualizations (no Chart.js dependency)
- GSAP-powered animations with ScrollTrigger
- Glassmorphism design system
- Fully responsive (mobile, tablet, desktop)
- Integrated with narrative and scoring engines
- Zero console errors, production-ready

## 🏗️ Architecture

```
User Assessment (index.html)
       ↓
Health Scoring Engine (core/HealthEngine.js)
       ↓
Narrative Engine (core/narrativeEngine.js)
       ↓
Dashboard Renderer (dashboardRenderer.js)
       ↓
Premium Dashboard UI (journey-advanced.html)
```

## 📁 Project Structure

```
├── index.html                 # Assessment form entry point
├── journey-advanced.html      # Premium AI Health Dashboard ⭐
├── journey.html              # Legacy dashboard
├── dashboardRenderer.js       # Dashboard rendering & animation logic
├── ai_app.js                 # Core application logic
│
├── core/
│   ├── HealthEngine.js       # Health scoring engine
│   ├── narrativeEngine.js    # Dynamic narrative generation
│   └── ai-knowledge-base.json # Health knowledge base
│
├── assets/
│   ├── js/
│   │   ├── assessment.js     # Assessment form handler
│   │   ├── engine.js         # Health calculation engine
│   │   └── core/             # Core scoring components
│   ├── css/
│   │   ├── dashboard.css     # Dashboard styles
│   │   └── theme.css         # Theme variables
│   └── images/               # 3D models and assets
│
└── ml/
    └── training-data.json     # ML training dataset
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Unlimitr-Self-Assement-Module-1
```

2. Install dependencies (if needed):
```bash
npm install
```

3. Start local server:
```bash
npm run serve
# or
npx serve . -l 3000
```

4. Open in browser:
```
http://localhost:3000
```

### Usage Flow

1. **Assessment** (`index.html`)
   - User completes health assessment form
   - Data saved to localStorage/sessionStorage

2. **Dashboard** (`journey-advanced.html`)
   - Loads assessment data automatically
   - Calculates health scores
   - Renders premium dashboard with animations
   - Displays personalized insights

## 🎨 Design System

### Color Palette
- **Green**: `#0F9D58` - Success, positive metrics
- **Amber**: `#E89B2C` - Moderate risk, warnings
- **Red**: `#D93025` - High risk, critical alerts
- **Dark**: `#1A1A1A` - Primary text
- **Muted**: `#6B7280` - Secondary text

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System font stack

### Spacing
- Max container width: `1200px`
- Generous padding and margins throughout
- Consistent 28px border-radius for cards

### Animation
- **Library**: GSAP 3.12.2 with ScrollTrigger
- **Easing**: `power2.out` (no bounce)
- **Duration**: 0.6-1.2s
- **Principles**: Smooth, controlled, premium feel

## 🔧 Core Components

### Health Scoring Engine
Located in `core/HealthEngine.js` and `assets/js/engine.js`:
- Calculates health score (0-100) based on:
  - BMI and body composition
  - Sleep quality
  - Stress levels
  - Activity level
  - Medical conditions

### Narrative Engine
Located in `core/narrativeEngine.js`:
- Generates empathetic, science-grounded narratives
- Adapts tone based on health score
- Provides condition-specific messaging
- Never uses shame, panic, or fear-based language

### Dashboard Renderer
Located in `dashboardRenderer.js`:
- Handles all dashboard rendering logic
- Manages GSAP animations
- Integrates with scoring and narrative engines
- Creates SVG visualizations dynamically

## 📊 Dashboard Sections

### 1. Authority Header
- H1: "Your Biological Intelligence Report"
- Dynamic narrative from narrative engine
- Premium 180-degree arc gauge with animated draw
- Score, status label, and subtext

### 2. Core System Drivers (6 Cards)
- Metabolic Efficiency
- Recovery Load
- Hormonal Regulation
- Insulin Sensitivity
- Movement Output
- Behavioral Stability

Each card features:
- Mini semi-radial arc gauge
- Score percentage
- 2-line explanation
- Severity badge (color-coded)

### 3. Biological Impact Map
- SVG human silhouette
- Interactive region highlighting on card hover
- Contextual tooltips
- Subtle pulse animation for high-risk areas

### 4. Trajectory Simulation
- Dual-path visualization:
  - Red dashed: No intervention (plateau risk)
  - Green smooth: With intervention (sustainable progress)
- Bezier curve paths for smooth visualization
- Animated path draw on scroll

### 5. Consistency Risk Forecast
- 12-week risk prediction
- Color-coded blocks (green/amber/red)
- Hover tooltips with week details
- Staggered fade-in animations

### 6. Strategic Roadmap
- Horizontal timeline
- 4 milestone nodes (Week 2, 4, 8, 12)
- Animated progress line
- Milestone descriptions

### 7. Conversion Block
- Centered premium card
- Clear messaging: "Your System Is Recoverable"
- Two CTAs:
  - Primary: "See My Recommended Solution"
  - Secondary: "Download Full Intelligence Report"

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with glassmorphism
- **JavaScript (ES5)** - Core logic and interactions
- **GSAP 3.12.2** - Premium animations
- **ScrollTrigger** - Scroll-based animations
- **SVG** - Pure vector graphics (no Chart.js)
- **LocalStorage/SessionStorage** - Data persistence

## 📝 Data Flow

1. User completes assessment → `assessment.js`
2. Data saved to storage → `localStorage.setItem("assessmentData")`
3. Dashboard loads → `journey-advanced.html`
4. Data retrieved → `dashboardRenderer.js` → `loadAssessmentData()`
5. Scores calculated → `calculateHealthScore()`
6. Narrative generated → `narrativeEngine.js`
7. Dashboard rendered → All sections animated with GSAP

## 🎯 Key Principles

### Design
- Premium, funded HealthTech SaaS aesthetic
- No Bootstrap default styling
- No childish glowing blobs
- No generic chart styles
- Authority and seriousness

### Performance
- Instant load (no fake loaders)
- Smooth 60fps animations
- Lightweight SVG visualizations
- Optimized scroll triggers

### User Experience
- Conversion-optimized
- Clear information hierarchy
- Accessible interactions
- Mobile-responsive

## 🔒 Data Privacy

- All data stored locally (localStorage/sessionStorage)
- No external API calls
- No data transmission
- Client-side processing only

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines if applicable]

## 📧 Contact

[Add contact information if applicable]

---

**Built with precision for health intelligence.** 🚀
