# DitheraAI Pro - Quick Reference Guide

**Project Name:** DitheraAI Pro - Advanced Dithering Plugin for Photoshop  
**Status:** Phase 0 - Setup  
**Target:** Sellable, production-ready plugin in 6 months  
**Monetization:** Freemium model ($29.99/month or $199.99/year)

---

## 📍 Project Location

```
d:\PortfolioProjectCode\
├── DitheraAI-Plugin/       (Main project folder - create this in Phase 0)
├── ROADMAP.md             (6-month development plan)
└── SETUP.md               (Phase 0 detailed setup)
```

---

## 🎯 Current Goals

**RIGHT NOW (This Week):**
1. Install Node.js, Git, VS Code, UXP Developer Tool
2. Create project structure
3. Get "Hello World" plugin running in Photoshop
4. Commit to GitHub

**Expected Time:** 2-4 hours of hands-on work

---

## 📋 What To Do Next (In Order)

### **Immediate Actions (Today/Tomorrow):**

1. **Install Software** (if not already done)
   - Node.js: https://nodejs.org/
   - Git: https://git-scm.com/download/win
   - VS Code: https://code.visualstudio.com/
   - UXP Developer Tool: Via Adobe Creative Cloud app
   - GitHub account: https://github.com/signup

2. **Create Project Structure**
   - Create folder: `d:\PortfolioProjectCode\DitheraAI-Plugin`
   - Copy all the files from SETUP.md into this folder
   - Run: `npm install`

3. **Initialize Git**
   ```powershell
   cd d:\PortfolioProjectCode\DitheraAI-Plugin
   git init
   git add .
   git commit -m "Initial setup"
   ```

4. **Test Plugin in Photoshop**
   - Open UXP Developer Tool
   - Add your plugin folder
   - Open Photoshop
   - Should see "DitheraAI Pro" in Plugins menu

### **Week 1-2 Goals (Phase 0):**
- All software installed and working
- Plugin loads in Photoshop without errors
- GitHub repo created with initial commit
- Development workflow documented

### **Week 3-6 Goals (Phase 1 - MVP):**
- Floyd-Steinberg algorithm working
- Real-time preview functional
- Basic UI with parameter controls
- Tests written and passing

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         Photoshop Application                        │
│  (Image data, Layers, Commands, Events)             │
└──────────────────────┬──────────────────────────────┘
                       │ UXP Bridge
                       ▼
┌─────────────────────────────────────────────────────┐
│      DitheraAI Pro Plugin (UXP)                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ React UI Component                            │   │
│  │ • Algorithm Selector                          │   │
│  │ • Parameter Sliders                           │   │
│  │ • Preview Canvas                              │   │
│  │ • Apply/Cancel Buttons                        │   │
│  └──────────────────────────────────────────────┘   │
│                       ▲ ▼                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ State Management (Zustand)                    │   │
│  │ • Current settings                            │   │
│  │ • Preview state                               │   │
│  │ • Presets                                     │   │
│  └──────────────────────────────────────────────┘   │
│                       ▲ ▼                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ Processing Engine                             │   │
│  │ • Algorithms (Floyd-Steinberg, etc.)         │   │
│  │ • Image Processing Utilities                  │   │
│  │ • Color Mapping                               │   │
│  │ • Web Workers (for performance)               │   │
│  └──────────────────────────────────────────────┘   │
│                       ▲ ▼                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ Photoshop Services                            │   │
│  │ • batchPlay API (execute commands)           │   │
│  │ • Get/Set pixel data                          │   │
│  │ • Layer management                            │   │
│  │ • Undo/Redo integration                       │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📁 File Structure (After Setup)

```
DitheraAI-Plugin/
├── src/
│   ├── index.tsx                 # React app entry point
│   ├── index.html                # UXP plugin HTML
│   ├── manifest.json             # UXP configuration
│   │
│   ├── components/
│   │   ├── DitherPanel.tsx        # Main UI panel (Phase 1)
│   │   ├── Preview.tsx            # Preview canvas (Phase 1)
│   │   ├── ParameterSliders.tsx   # Controls (Phase 1)
│   │   └── PresetManager.tsx      # Presets UI (Phase 2)
│   │
│   ├── algorithms/
│   │   ├── base.ts               # Abstract algorithm interface
│   │   ├── floyd-steinberg.ts    # First algorithm (Phase 1)
│   │   ├── ordered.ts            # Ordered dithering (Phase 2)
│   │   ├── adaptive.ts           # Your proprietary algo (Phase 2)
│   │   └── index.ts              # Algorithm registry
│   │
│   ├── services/
│   │   ├── photoshop.ts          # Photoshop API wrapper
│   │   ├── imageProcessor.ts     # Image data handling
│   │   └── storage.ts            # Local storage for presets
│   │
│   ├── utils/
│   │   ├── colorSpace.ts         # RGB ↔ other color spaces
│   │   ├── imageUtils.ts         # Image manipulation helpers
│   │   └── math.ts               # Mathematical utilities
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   │
│   ├── styles/
│   │   ├── index.css             # Global styles
│   │   ├── components.css        # Component styles
│   │   └── variables.css         # Design tokens
│   │
│   └── hooks/                    # Custom React hooks (Phase 2+)
│       └── .gitkeep
│
├── tests/
│   ├── algorithms/
│   │   └── floyd-steinberg.test.ts
│   └── utils/
│       └── colorSpace.test.ts
│
├── public/
│   └── preview-placeholder.png   # UI graphics
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tsconfig.json
├── webpack.config.js
├── jest.config.js
├── README.md
├── ROADMAP.md
└── SETUP.md
```

---

## 🔄 Development Workflow

### Daily Development (Weeks 1+)

```powershell
# Open project folder
cd d:\PortfolioProjectCode\DitheraAI-Plugin

# Start UXP Developer Tool (and webpack watch if configured)
npm run dev

# In Photoshop:
# Plugins > Development > DitheraAI Pro
# (Live reload when files change)

# Make code changes in VS Code
# Photoshop panel updates automatically

# When ready to commit:
git add .
git commit -m "Feature: add Floyd-Steinberg algorithm"
git push
```

### Build for Distribution

```powershell
npm run build        # Create production build
# (Then package via UXP Developer Tool)
```

---

## 💡 Key Concepts You'll Learn

| Concept | Phase | Why Important |
|---------|-------|---------------|
| UXP Plugin Architecture | 0-1 | Foundation of everything |
| batchPlay API | 1 | Execute Photoshop commands |
| Canvas Image Data | 1 | Read/write pixel data |
| Dithering Algorithms | 1-2 | Core feature |
| Color Quantization | 2 | Color palette reduction |
| React State Management | 1+ | Plugin UI |
| Web Workers | 3+ | Performance optimization |
| Batch Processing | 3 | Multiple file handling |

---

## 🎓 Learning Resources (Bookmark These)

### Official Documentation
- [Adobe UXP Docs](https://developer.adobe.com/photoshop/uxp/)
- [Photoshop API Reference](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/)
- [UXP API Reference](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/)

### Code Samples
- [Adobe UXP Samples](https://github.com/AdobeDocs/uxp-photoshop-plugin-samples)
- [XD Plugin Samples](https://github.com/AdobeXD/plugin-samples)

### Learning
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Dithering Algorithm Explanation](https://en.wikipedia.org/wiki/Dithering)

### Community
- [Creative Cloud Developer Forums](https://forums.creativeclouddeveloper.com/)
- [Stack Overflow (tag: photoshop-plugin)](https://stackoverflow.com/questions/tagged/photoshop-plugin)

---

## ⚙️ Terminal Commands Reference

```powershell
# Setup
npm install                      # Install dependencies
npm init                        # Start new npm project

# Development
npm run dev                     # Start development with webpack
npm run build                   # Production build
npm run lint                    # Check code quality
npm run format                  # Auto-format code
npm test                        # Run tests
npm test:watch                  # Run tests in watch mode

# Git
git init                        # Initialize repo
git add .                       # Stage all changes
git commit -m "message"         # Commit with message
git push                        # Push to GitHub
git log --oneline              # View commit history

# Node/npm
npm --version                   # Check npm version
node --version                  # Check Node version
npm cache clean --force         # Clear npm cache
npm update                      # Update packages
```

---

## 📊 Progress Tracking

```
Phase 0: Setup (Week 1-2)
├── Software Installation ............ □
├── Project Structure ................ □
├── Git Setup ........................ □
├── Hello World Plugin ............... □
└── Status: Not Started

Phase 1: MVP (Week 3-6)
├── Floyd-Steinberg Algorithm ........ □
├── Image Processing Pipeline ........ □
├── Basic React UI ................... □
├── Real-time Preview ................ □
└── Status: Not Started

Phase 2: Advanced Features (Week 7-12)
├── Additional Algorithms ............ □
├── Color Mapping System ............. □
├── Presets System ................... □
└── Status: Not Started

Phases 3-6: TBD
```

---

## 🔐 Important Notes

1. **Private Repo Recommended** - Don't share your plugin code publicly until launch
2. **Test Frequently** - Test in Photoshop after every major feature
3. **Keep Backups** - Push to GitHub regularly
4. **Document as You Go** - Future you will thank current you
5. **Performance First** - Dithering is computationally heavy; optimize early
6. **User Experience** - You're a design major; use this superpower!

---

## ❓ Quick FAQ

**Q: Can I use Python instead of TypeScript?**  
A: No, UXP only supports JavaScript/TypeScript for plugins.

**Q: Can I test without Photoshop 2022+?**  
A: No, you need Photoshop 2022+ or later.

**Q: How long will this actually take?**  
A: MVP in 2-3 months if you work 10-15 hrs/week. Full feature in 6 months.

**Q: Can I sell this before Phase 5?**  
A: Yes! You can sell via your own website anytime after Phase 1. Adobe Exchange requires Phase 4.

**Q: What if I get stuck?**  
A: Check Adobe forums, Stack Overflow, and the sample code. Most issues have been solved.

---

## 🚀 Ready to Start?

1. **Right now:** Read SETUP.md completely
2. **Next 30 min:** Install software
3. **Next hour:** Create project folder & files
4. **Next 2 hours:** Test "Hello World" in Photoshop
5. **This week:** Complete Phase 0 checklist

**Let's build something amazing! 💪**
