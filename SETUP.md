# Phase 0: Setup & Infrastructure Checklist

**Duration:** Week 1-2  
**Goal:** Get development environment running + test "Hello World" plugin in Photoshop  
**Success Criteria:** Plugin loads and displays UI in Photoshop with no errors

---

## ✅ Software Installation Checklist

### 1. **Node.js & npm** (15 min)
- [ ] Download Node.js LTS from https://nodejs.org/
- [ ] Run installer (use defaults)
- [ ] Verify installation:
  ```powershell
  node --version    # Should be v18+ or v20+
  npm --version     # Should be v9+
  ```

### 2. **Git** (10 min)
- [ ] Download from https://git-scm.com/download/win
- [ ] Run installer (use defaults)
- [ ] Verify installation:
  ```powershell
  git --version
  ```

### 3. **VS Code** (10 min)
- [ ] Download from https://code.visualstudio.com/
- [ ] Run installer
- [ ] Install recommended extensions:
  - [ ] **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
  - [ ] **ESLint** (dbaeumer.vscode-eslint)
  - [ ] **Prettier** (esbenp.prettier-vscode)
  - [ ] **TypeScript Vue Plugin** (Vue.vscode-typescript-vue-plugin)
  - [ ] **Git Graph** (mhutchie.git-graph)
  - [ ] **REST Client** (humao.rest-client) - for testing APIs

### 4. **Adobe UXP Developer Tool** (20 min)
- [ ] Make sure Adobe Creative Cloud is installed with Photoshop 2022+
- [ ] Open Creative Cloud app
- [ ] Go to "All Apps" or search for "UXP Developer Tool"
- [ ] Install it
- [ ] Verify by opening it (it's a standalone app)

### 5. **GitHub Account** (5 min)
- [ ] Go to https://github.com/signup
- [ ] Create free account
- [ ] Verify email

---

## 🗂️ Project Structure Setup (30 min)

### Create initial folder structure:

```
d:\PortfolioProjectCode\DitheraAI-Plugin\
├── src/
│   ├── components/           # React components
│   │   └── .gitkeep
│   ├── algorithms/           # Dithering algorithms
│   │   └── .gitkeep
│   ├── services/             # Photoshop API interactions
│   │   └── .gitkeep
│   ├── utils/                # Utility functions
│   │   └── .gitkeep
│   ├── types/                # TypeScript type definitions
│   │   └── .gitkeep
│   ├── styles/               # CSS modules
│   │   └── .gitkeep
│   ├── index.tsx             # Entry point
│   └── manifest.json         # UXP plugin configuration
│
├── public/                   # Static assets
│   └── .gitkeep
│
├── tests/                    # Test files
│   └── .gitkeep
│
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── tsconfig.json
├── webpack.config.js
├── package.json
├── README.md
├── SETUP.md                  # This file, can be in root or docs/
└── ROADMAP.md               # (already created)
```

---

## 📝 Initialize Project Files

### Step 1: Create Project Directory
```powershell
cd d:\PortfolioProjectCode
mkdir DitheraAI-Plugin
cd DitheraAI-Plugin
```

### Step 2: Initialize Git
```powershell
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 3: Create `.gitignore`
Create file `d:\PortfolioProjectCode\DitheraAI-Plugin\.gitignore`:

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
dist/
build/
.uxp

# IDE
.vscode/settings.json
.DS_Store
*.swp
*.swo
*~

# Environment
.env
.env.local
.env.*.local

# Logs
npm-debug.log*
yarn-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
temp/
tmp/
```

### Step 4: Create `package.json`
Create file `d:\PortfolioProjectCode\DitheraAI-Plugin\package.json`:

```json
{
  "name": "dithera-ai-pro",
  "version": "0.0.1",
  "description": "Advanced dithering plugin for Adobe Photoshop",
  "main": "index.js",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  },
  "keywords": [
    "photoshop",
    "plugin",
    "uxp",
    "dithering",
    "art"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@adobe/uxp": "latest",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.23.0",
    "@babel/preset-typescript": "^7.23.0",
    "@types/jest": "^29.5.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "babel-loader": "^9.1.0",
    "eslint": "^8.50.0",
    "eslint-plugin-react": "^7.33.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "ts-loader": "^9.5.0",
    "typescript": "^5.2.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0"
  }
}
```

### Step 5: Create `tsconfig.json`
Create file `d:\PortfolioProjectCode\DitheraAI-Plugin\tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Step 6: Create `.eslintrc.json`
Create file `d:\PortfolioProjectCode\DitheraAI-Plugin\.eslintrc.json`:

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react", "@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### Step 7: Create `.prettierrc`
Create file `d:\PortfolioProjectCode\DitheraAI-Plugin\.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 📦 Install Dependencies (10 min)

```powershell
cd d:\PortfolioProjectCode\DitheraAI-Plugin
npm install
```

This will create:
- `node_modules/` folder
- `package-lock.json` file

---

## 📄 Create Initial Source Files

### 1. Create `src/index.tsx` (Hello World Plugin)

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';

function App() {
  return (
    <div className="app">
      <h1>DitheraAI Pro</h1>
      <p>Advanced Dithering Plugin</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Version 0.0.1 - Setup Phase
      </p>
    </div>
  );
}

const root = document.getElementById('root') || document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Create `src/manifest.json` (UXP Configuration)

```json
{
  "id": "com.dithera.ai.pro",
  "name": "DitheraAI Pro",
  "version": "0.0.1",
  "description": "Advanced dithering and bitmapping plugin for Photoshop",
  "requiredPermissions": [
    "webview",
    "localFileSystem",
    "allowCodeGenerationFromStrings"
  ],
  "uiModes": [
    {
      "type": "panel",
      "name": "DitheraAI Pro"
    }
  ],
  "requiredApiVersion": 1,
  "plugins": [
    {
      "name": "DitheraAI Pro",
      "main": "index.html",
      "uiEntryPoints": [
        {
          "type": "panel",
          "name": "DitheraAI Pro"
        }
      ]
    }
  ]
}
```

### 3. Create `src/index.html` (Plugin HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DitheraAI Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        #root {
            padding: 16px;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script src="index.tsx"></script>
</body>
</html>
```

### 4. Create `src/styles/index.css`

```css
:root {
  --color-primary: #0d66d0;
  --color-text: #333;
  --color-bg: #f5f5f5;
  --color-border: #ddd;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 16px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
}

.app {
  padding: var(--spacing-lg);
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app h1 {
  font-size: 18px;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
}

.app p {
  margin: var(--spacing-sm) 0;
  line-height: 1.4;
}
```

### 5. Create `src/types/index.ts` (TypeScript Types)

```typescript
/**
 * Core type definitions for DitheraAI Pro plugin
 */

export interface DitherSettings {
  algorithm: 'floyd-steinberg' | 'ordered' | 'threshold' | 'adaptive';
  intensity: number; // 0-100
  colorDepth: number; // 2-256
  threshold: number; // 0-255
  blurRadius: number; // 0-50
  sharpenAmount: number; // 0-100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
}

export interface ColorMapping {
  shadows: string; // hex color
  midtones: string; // hex color
  highlights: string; // hex color
}

export interface DitherPreset {
  id: string;
  name: string;
  settings: DitherSettings;
  colorMapping?: ColorMapping;
  thumbnail?: string; // base64 preview image
  createdAt: number;
}

export interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA pixel data
}
```

### 6. Create `src/algorithms/.gitkeep` (placeholder)

### 7. Create `src/components/.gitkeep` (placeholder)

### 8. Create `src/services/.gitkeep` (placeholder)

### 9. Create `src/utils/.gitkeep` (placeholder)

### 10. Create `README.md`

```markdown
# DitheraAI Pro - Photoshop Plugin

Advanced dithering and bitmapping plugin for Adobe Photoshop 2022+.

## Development Setup

See [SETUP.md](SETUP.md) for installation and setup instructions.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed project timeline and phases.

## Tech Stack

- **Language:** TypeScript
- **UI:** React with UXP
- **Build:** Webpack
- **Testing:** Jest

## Getting Started

```bash
npm install
npm run dev
```

The UXP Developer Tool will open - use it to load and test the plugin in Photoshop.

## License

MIT
```

---

## 🔧 Webpack Configuration (Optional but Recommended)

Create `webpack.config.js`:

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '.uxp/build'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    static: path.join(__dirname, 'src'),
    compress: true,
    port: 8080,
  },
};
```

---

## 📌 Git Initial Commit

```powershell
cd d:\PortfolioProjectCode\DitheraAI-Plugin

# Add all files
git add .

# Create first commit
git commit -m "Initial project setup with TypeScript, React, and UXP configuration"

# (Optional) Create GitHub repo and push
# git remote add origin https://github.com/YOUR_USERNAME/dithera-ai-pro.git
# git branch -M main
# git push -u origin main
```

---

## 🧪 Test the Setup (First Time Running Plugin)

### 1. Open UXP Developer Tool
- Launch the UXP Developer Tool (installed earlier)
- You should see a folder icon to add plugins

### 2. Add Your Plugin
- Click "Add Plugin" or similar option
- Navigate to `d:\PortfolioProjectCode\DitheraAI-Plugin`
- Select it

### 3. Open Photoshop
- Launch Adobe Photoshop 2022+
- Go to **Plugins > Development > DitheraAI Pro** (or similar)
- You should see a panel appear with "DitheraAI Pro - Advanced Dithering Plugin"

### 4. Verify Success ✅
- Panel loads without errors
- You see the heading and text
- No console errors in UXP Developer Tool

**If successful:** Move to Phase 1! 🎉  
**If failed:** Check console for errors, look at troubleshooting section below.

---

## 🚨 Troubleshooting Phase 0

### Problem: "Plugin not found in Photoshop"
**Solution:**
1. Ensure Photoshop 2022+ is running
2. Restart UXP Developer Tool
3. Check manifest.json is in `src/` folder
4. Verify `index.html` exists

### Problem: "Node not found" / npm command fails
**Solution:**
1. Reinstall Node.js
2. Restart PowerShell/terminal after install
3. Verify: `node --version` and `npm --version`

### Problem: Dependencies fail to install
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

### Problem: TypeScript errors
**Solution:**
1. VS Code > View > Command Palette
2. Search "TypeScript: Restart TS Server"
3. Press Enter

---

## ✨ Success Criteria - Phase 0 Complete

- [x] Node.js, npm, Git installed
- [x] UXP Developer Tool installed and working
- [x] GitHub account created
- [x] Project folder structure created
- [x] All config files created (tsconfig, eslint, prettier, webpack)
- [x] package.json with dependencies
- [x] Git initialized with first commit
- [x] Hello World plugin loads in Photoshop without errors
- [x] UXP Developer Tool can see and manage the plugin

---

## 📚 Next: Phase 1

Once Phase 0 is complete:
1. Move to `Phase 1: Core Architecture & MVP Algorithm`
2. Start building the Floyd-Steinberg dithering algorithm
3. Create image processing pipeline
4. Build advanced parameter UI

**Estimated time for Phase 1:** 4 weeks

---

## 🔗 Useful Resources

- [Adobe UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [UXP API Reference](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/)
- [Photoshop API Reference](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/)
- [Adobe Sample Plugins](https://github.com/AdobeDocs/uxp-photoshop-plugin-samples)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
