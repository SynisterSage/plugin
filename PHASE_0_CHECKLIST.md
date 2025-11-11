# 🚀 Phase 0 Launch Checklist - Your Next Actions

**Status:** Ready to Begin Phase 0  
**Date:** November 11, 2025  
**Estimated Duration:** 1-2 weeks  
**Outcome:** Development environment fully ready, "Hello World" plugin running in Photoshop

---

## 📋 Your Exact Next Steps (In Order)

### TODAY (30 minutes)

#### Step 1: Download UXP Developer Tool ✅
- [ ] Go to **Creative Cloud app** → "All Apps"
- [ ] Search for "UXP Developer Tool"
- [ ] Click "Install"
- [ ] Wait for installation (~5 min)
- [ ] Launch it (icon appears in app launcher)
- [ ] **VERIFY:** You see the UXP Developer Tool interface open

#### Step 2: Create Adobe Developer Account
- [ ] Go to https://developer.adobe.com/
- [ ] Click "Sign up" or use existing Adobe ID
- [ ] Create account if needed
- [ ] Verify email
- [ ] **VERIFY:** You can log in to https://developer.adobe.com/console/

#### Step 3: Create Project in Adobe Developer Console (Optional but good to do)
- [ ] Go to https://developer.adobe.com/console/
- [ ] Click "Create new project"
- [ ] Name: "DitheraAI Pro Development"
- [ ] Select "Photoshop UXP" as product
- [ ] **VERIFY:** Project created (don't need anything else yet)

---

### THIS WEEK (Days 2-4) - Environment Setup

#### Step 4: Install Node.js & npm
- [ ] Download from https://nodejs.org/ (LTS version)
- [ ] Run installer (click Next through defaults)
- [ ] Open **PowerShell** terminal
- [ ] Verify: Run these commands:
  ```powershell
  node --version    # Should show v18+ or v20+
  npm --version     # Should show v9+
  ```
- [ ] **VERIFY:** Both commands show version numbers

#### Step 5: Install Git
- [ ] Download from https://git-scm.com/download/win
- [ ] Run installer (click Next through defaults)
- [ ] Restart PowerShell
- [ ] Verify: Run this command:
  ```powershell
  git --version
  ```
- [ ] **VERIFY:** Shows git version

#### Step 6: Install VS Code
- [ ] Download from https://code.visualstudio.com/
- [ ] Run installer
- [ ] Open VS Code
- [ ] Install Extensions:
  - [ ] **ES7+ React/Redux snippets** (by dsznajder)
  - [ ] **ESLint** (by dbaeumer)
  - [ ] **Prettier** (by esbenp)
  - [ ] **TypeScript Vue Plugin** (by Vue)
- [ ] **VERIFY:** All extensions installed and enabled

#### Step 7: Create Project Folder Structure
- [ ] Open PowerShell
- [ ] Run these commands:
  ```powershell
  cd d:\PortfolioProjectCode
  mkdir DitheraAI-Plugin
  cd DitheraAI-Plugin
  ```
- [ ] You should now be in: `d:\PortfolioProjectCode\DitheraAI-Plugin\`

#### Step 8: Create Essential Files (Use SETUP.md)
- [ ] Open `d:\PortfolioProjectCode\SETUP.md`
- [ ] Follow sections 3-10 to create all config files:
  - [ ] `.gitignore`
  - [ ] `package.json`
  - [ ] `tsconfig.json`
  - [ ] `.eslintrc.json`
  - [ ] `.prettierrc`
  - [ ] Create folders: `src/`, `tests/`, `public/`

#### Step 9: Install Dependencies
- [ ] In PowerShell (in your DitheraAI-Plugin folder):
  ```powershell
  npm install
  ```
- [ ] Wait 3-5 minutes
- [ ] **VERIFY:** Folder now has `node_modules/` subfolder

#### Step 10: Create Source Files
- [ ] Create `src/index.tsx` - Copy from SETUP.md
- [ ] Create `src/index.html` - Copy from SETUP.md
- [ ] Create `src/manifest.json` - Copy from SETUP.md
- [ ] Create `src/styles/index.css` - Copy from SETUP.md
- [ ] Create `src/types/index.ts` - Copy from SETUP.md
- [ ] Create placeholder files:
  - [ ] `src/components/.gitkeep`
  - [ ] `src/algorithms/.gitkeep`
  - [ ] `src/services/.gitkeep`
  - [ ] `src/utils/.gitkeep`

---

### END OF WEEK (Days 5-7) - First Test

#### Step 11: Initialize Git Repository
- [ ] In PowerShell (in DitheraAI-Plugin folder):
  ```powershell
  git init
  git config user.name "Your Name"
  git config user.email "your@email.com"
  git add .
  git commit -m "Initial project setup with TypeScript, React, UXP"
  ```
- [ ] **VERIFY:** All files tracked in git

#### Step 12: Test Plugin in Photoshop
- [ ] Open **UXP Developer Tool**
- [ ] Click "Add Plugin"
- [ ] Navigate to `d:\PortfolioProjectCode\DitheraAI-Plugin`
- [ ] Select the folder
- [ ] Open **Adobe Photoshop 2022+**
- [ ] Go to **Plugins → Development → DitheraAI Pro**
- [ ] **VERIFY:** A panel appears with "DitheraAI Pro - Advanced Dithering Plugin"
- [ ] **VERIFY:** No console errors

#### Step 13: Create GitHub Repository (Optional but Recommended)
- [ ] Go to https://github.com/new
- [ ] Name: "dithera-ai-pro"
- [ ] Description: "Advanced dithering plugin for Adobe Photoshop"
- [ ] Make it **Private** (keep your code safe)
- [ ] Click "Create repository"
- [ ] In PowerShell (in your project folder):
  ```powershell
  git remote add origin https://github.com/YOUR_USERNAME/dithera-ai-pro.git
  git branch -M main
  git push -u origin main
  ```
- [ ] **VERIFY:** Code pushed to GitHub

---

## ✅ Phase 0 Completion Checklist

Before moving to Phase 1, confirm ALL of these:

### Environment ✅
- [ ] Node.js installed (v18+)
- [ ] npm installed (v9+)
- [ ] Git installed
- [ ] VS Code installed with extensions
- [ ] UXP Developer Tool installed
- [ ] Adobe Developer account created

### Project Setup ✅
- [ ] Project folder created: `d:\PortfolioProjectCode\DitheraAI-Plugin\`
- [ ] All config files created (tsconfig, eslint, prettier)
- [ ] `package.json` created with dependencies
- [ ] `npm install` completed successfully
- [ ] All source files created (index.tsx, manifest.json, etc.)
- [ ] Git initialized locally

### First Test ✅
- [ ] "Hello World" plugin loads in Photoshop without errors
- [ ] UXP Developer Tool recognizes plugin
- [ ] No console errors or warnings
- [ ] Panel displays with correct title

### Git/GitHub ✅
- [ ] First commit created locally
- [ ] GitHub repository created (optional)
- [ ] Code pushed to GitHub (optional)

---

## 🎯 Success Criteria for Phase 0

### You'll know Phase 0 is complete when:

1. ✅ You can open Photoshop, go to Plugins → Development → DitheraAI Pro, and see a working panel
2. ✅ The panel shows "DitheraAI Pro" header
3. ✅ No JavaScript errors in UXP Developer Tool console
4. ✅ Project folder has all files (src/, node_modules/, config files)
5. ✅ Git repository initialized (either locally or on GitHub)
6. ✅ You understand the project structure

**When all 6 are true, Phase 0 is complete.** ✅

---

## 📊 Time Breakdown

| Task | Est. Time |
|------|-----------|
| Install UXP Tool + Adobe Account | 20 min |
| Install Node.js + Git + VS Code | 30 min |
| Create project folder & files | 30 min |
| npm install | 5 min |
| Test in Photoshop | 15 min |
| GitHub setup (optional) | 10 min |
| **TOTAL** | **~2 hours hands-on** |

**Plus reading time:** 1 hour (read SETUP.md carefully)  
**Total Phase 0: ~3 hours of focused work**

---

## 🎬 What Happens Next (Week 2)

Once Phase 0 is complete, you'll:

1. **Read ARCHITECTURE.md** (understand system design)
2. **Start Phase 1:**
   - Create `src/services/photoshop.ts` - Connect to Photoshop API
   - Create `src/utils/colorSpace.ts` - Color conversion functions
   - Create `src/utils/imageUtils.ts` - Image processing
   - Create `src/algorithms/floyd-steinberg.ts` - First algorithm
   - Create React UI components for settings

3. **By week 6:** Have working MVP with real-time preview

---

## ⚠️ Important Notes

### About VS Code & Project Opening
- **After creating files:** Open entire project folder in VS Code
  ```powershell
  code d:\PortfolioProjectCode\DitheraAI-Plugin
  ```
- This gives you full IntelliSense and TypeScript support

### About npm install
- Takes 3-5 minutes first time
- Creates `node_modules/` folder (~500MB)
- Only do this once
- Later: `npm update` to update packages

### About Photoshop Version
- **You MUST have Photoshop 2022+** (UXP requirement)
- 2020/2021 won't work
- Check Help → About Photoshop to verify version

### About File Paths
- Always use absolute paths: `d:\PortfolioProjectCode\...`
- Never use relative paths in commands
- PowerShell is case-insensitive but keep consistency

---

## 🆘 If You Get Stuck

### "npm install fails"
```powershell
npm cache clean --force
npm install
```

### "Node/git not found"
- Restart PowerShell completely (close and reopen)
- Verify installation by running commands again

### "Plugin doesn't appear in Photoshop"
- Check UXP Developer Tool console for errors
- Verify `manifest.json` is in `src/` folder
- Verify Photoshop version is 2022+
- Restart Photoshop

### "TypeScript errors in VS Code"
- View → Command Palette → "TypeScript: Restart TS Server"

### Can't find files created
- Make sure you're in the right folder
- Use `pwd` to check current directory
- Use `ls` or `dir` to list files

---

## 📞 Getting Help During Phase 0

If you get truly stuck:

1. **Check SETUP.md** - Most common issues covered
2. **Adobe Docs:** https://developer.adobe.com/photoshop/uxp/
3. **Stack Overflow:** Search "photoshop UXP plugin"
4. **Creative Cloud Forums:** https://forums.creativeclouddeveloper.com/

---

## 🎉 The Big Picture

After Phase 0, you'll have:
- ✅ Professional dev environment
- ✅ Project structure ready for code
- ✅ First commit to GitHub
- ✅ Working test in Photoshop
- ✅ Ready to implement algorithms

That's **the hard part done**. Coding is actually easier. 🚀

---

## 🔄 Your Workflow After Phase 0

Once Phase 0 is complete, your daily workflow will be:

```
1. Open PowerShell → cd d:\PortfolioProjectCode\DitheraAI-Plugin
2. Open VS Code → code .
3. Make code changes
4. Save file (Ctrl+S)
5. See preview update in Photoshop (auto-reload via UXP Dev Tool)
6. When happy, commit:
   git add .
   git commit -m "Feature: [what you did]"
   git push
7. Repeat!
```

That's it. Very streamlined.

---

## ✨ Final Thought

You're about to start building something real. 

Phase 0 is **just setup**. It feels tedious but it's necessary. Once it's done, you can focus on the actual fun part: **writing algorithms and seeing them dither images in real-time**.

**You've got all the knowledge you need. Now just execute.**

---

**Ready? Start with Step 1. Download UXP Developer Tool. Let me know when you get to the "Hello World" test!** 🚀

**Questions about any step? Ask before you do it.** 💡
