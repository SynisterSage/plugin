# DitheraAI Pro - UI & Logic Design Document

**Based on:** Dithertone Pro UI mockups + Design best practices  
**Status:** Approved design for Phase 1 implementation  
**Date:** November 11, 2025

---

## 🎨 Overview

The DitheraAI Pro plugin UI follows a **3-tab panel interface** that appears as a docked panel in Adobe Photoshop. The design emphasizes:
- **Clarity** - Clear labels and organized controls
- **Visual feedback** - Real-time preview updates
- **Efficiency** - All controls on one compact panel
- **Power** - Advanced features accessible without clutter

---

## 📐 UI Structure

### Panel Layout

```
┌─────────────────────────────────────────────┐
│ DitheraAI Pro                           [⚙️] │  ← Header with settings icon
├─────────────────────────────────────────────┤
│                                             │
│  [RENDER SETTINGS] [EFFECT CONTROLS] [TONAL] │  ← 3 Tabs
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Content of selected tab]                  │
│  [All controls & sliders]                   │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  [ CANCEL ]                [ SAVE/RENDER ]   │  ← Action buttons
└─────────────────────────────────────────────┘
```

### Dimensions
- **Panel Width:** 320px (typical Photoshop plugin width)
- **Panel Height:** 600-700px (scrollable if needed)
- **Vertical Rhythm:** 8px baseline spacing
- **Color Scheme:** Dark theme (Photoshop default)

---

## 🎯 Tab 1: RENDER SETTINGS

**Purpose:** Global image processing settings and algorithm selection  
**Icon:** ⚙️ (gear icon)

### Controls Layout

```
┌─ RENDER SETTINGS ─────────────────────────┐
│                                           │
│  Input DPI                                │
│  [72]  ─●─────────────────────────────── │  Slider: 1-600, default 72
│                                           │
│  Resampling                               │
│  [Preserve Details ▼]                     │  Dropdown: Preserve Details, etc
│                                           │
│  Algorithm                                │
│  [Floyd Steinberg ▼]                      │  Dropdown: See algorithm list
│                                           │
│  Quick Presets (Icon Row)                 │
│  [A] [■] [◉] [◆] [◇] [?] [⊗]            │  8 algorithm/preset buttons
│                                           │
└───────────────────────────────────────────┘
```

### Detailed Controls

#### 1. Input DPI Slider
- **Label:** "Input DPI"
- **Type:** Range slider with number input
- **Range:** 1 - 600 DPI
- **Default:** 72
- **Step:** 1
- **Purpose:** Controls output resolution, affects dithering pattern size
- **Visual:** Slider + text input field showing current value
- **onChange:** Real-time preview update

#### 2. Resampling Dropdown
- **Label:** "Resampling"
- **Type:** Select dropdown
- **Options:**
  - Preserve Details (default)
  - Smooth
  - Sharp
- **Purpose:** Pre-processing method before dithering
- **onChange:** Real-time preview update

#### 3. Algorithm Dropdown
- **Label:** "Algorithm"
- **Type:** Select dropdown
- **Options (MVP Phase 1):**
  - Floyd Steinberg (default) - Best quality
  - 2x2 Bayer
  - 4x4 Bayer
  - 8x8 Bayer
  
- **Options (Phase 2+):**
  - Ordered Dithering (various sizes)
  - Jarvis-Judice-Ninke
  - Atkinson
  - Threshold
  - Adaptive (proprietary)

- **Purpose:** Select dithering algorithm
- **onChange:** Real-time preview update, update quick preset buttons

#### 4. Quick Preset Buttons (Icon Row)
- **Type:** 8 icon buttons in a row
- **Purpose:** Quick algorithm selection
- **Visual:**
  ```
  [A] [■] [◉] [◆] [◇] [?] [⊗]
   │   │   │   │   │   │   │
   │   │   │   │   │   │   └─ More options
   │   │   │   │   │   └───── Custom preset
   │   │   │   │   └────────── Threshold
   │   │   │   └───────────── Adaptive
   │   │   └────────────────── Atkinson
   │   └─────────────────────── Ordered (Bayer)
   └────────────────────────── Floyd Steinberg (Default)
  ```

- **Behavior:**
  - Click to select algorithm
  - Selected button is highlighted
  - Updates Algorithm dropdown
  - Updates preview in real-time
  - Hover shows algorithm name tooltip

---

## 🎯 Tab 2: EFFECT CONTROLS

**Purpose:** Image enhancement and processing parameters  
**Icon:** 🎨 (paintbrush icon)

### Controls Layout

```
┌─ EFFECT CONTROLS ─────────────────────────┐
│                                           │
│  Sharpen Strength                         │
│  [0]  ─○─────────────────────────────── │  Slider + input
│                                           │
│  Sharpen Radius                           │
│  [9]  ─●─────────────────────────────── │  Slider + input
│                                           │
│  Noise                                    │
│  [0]  ─○─────────────────────────────── │  Slider + input
│                                           │
│  Denoise                                  │
│  [0]  ─○─────────────────────────────── │  Slider + input
│                                           │
│  Blur                                     │
│  [0]  ─○─────────────────────────────── │  Slider + input
│                                           │
│  Brightness                               │
│  [-119] ─●─────────────────────────────── │  Slider + input
│                                           │
│  Contrast                                 │
│  [0]  ─●─────────────────────────────── │  Slider + input
│                                           │
└───────────────────────────────────────────┘
```

### Detailed Controls

All controls follow same pattern: **Label + Slider + Text Input**

#### 1. Sharpen Strength
- **Range:** 0 - 100
- **Default:** 0
- **Step:** 1
- **Unit:** percentage
- **Purpose:** Amount of sharpening to apply before dithering
- **Effect:** Higher = more edge definition in dithered output

#### 2. Sharpen Radius
- **Range:** 0 - 50
- **Default:** 9
- **Step:** 0.5
- **Unit:** pixels
- **Purpose:** Radius of sharpen kernel
- **Effect:** Affects size of sharpening effect

#### 3. Noise
- **Range:** 0 - 100
- **Default:** 0
- **Step:** 1
- **Unit:** percentage
- **Purpose:** Add random noise before dithering
- **Effect:** Adds randomness, reduces banding in flat areas

#### 4. Denoise
- **Range:** 0 - 100
- **Default:** 0
- **Step:** 1
- **Unit:** percentage
- **Purpose:** Remove noise before dithering
- **Effect:** Smooths the image, reduces noise artifacts

#### 5. Blur
- **Range:** 0 - 50
- **Default:** 0
- **Step:** 0.5
- **Unit:** pixels
- **Purpose:** Gaussian blur radius before dithering
- **Effect:** Smooths image, affects dithering pattern

#### 6. Brightness
- **Range:** -100 to 100
- **Default:** 0
- **Step:** 1
- **Unit:** absolute value (-100 = black, 0 = unchanged, 100 = white)
- **Purpose:** Adjust overall image brightness
- **Effect:** Before dithering applied

#### 7. Contrast
- **Range:** -100 to 100
- **Default:** 0
- **Step:** 1
- **Unit:** absolute value (-100 = flat gray, 0 = unchanged, 100 = max contrast)
- **Purpose:** Adjust image contrast
- **Effect:** Before dithering applied

### Control Styling

Each control row:
```
[Label ·················] 
[Value ─●─────────────────] [Input Field]
```

- **Label:** Bold, left-aligned, 140px width
- **Slider:** Flex-grow, visual feedback on hover
- **Input:** 40px width, number input only, direct edit support
- **Spacing:** 8px between controls, 12px after each group

---

## 🎯 Tab 3: TONAL CONTROLS

**Purpose:** Color mapping and tonal adjustments  
**Icon:** 🎨 (palette icon)

### Controls Layout

```
┌─ TONAL CONTROLS ──────────────────────────┐
│                                           │
│  Tonal Mapping                            │
│  [1 Color ▼]                              │  Dropdown
│                                           │
│  Highlights                               │
│  [Color Swatch] ─○─────────────────────── │  Color picker + brightness
│                                           │
│  Midtones                                 │
│  [Color Swatch] ─○─────────────────────── │  Color picker + brightness
│                                           │
│  Shadows                                  │
│  [Color Swatch] ─○─────────────────────── │  Color picker + brightness
│                                           │
│  Background                               │
│  [Black ▼]                                │  Dropdown: Black, White, Custom
│                                           │
└───────────────────────────────────────────┘
```

### Detailed Controls

#### 1. Tonal Mapping Dropdown
- **Label:** "Tonal Mapping"
- **Type:** Select dropdown
- **Options (MVP):**
  - 1 Color (default) - Single color dithering
  - 3 Color - Map to 3 colors
  - 5 Color - Map to 5 colors
  - Custom Palette - User-provided palette
  
- **Purpose:** Select color mapping strategy
- **onChange:** Show/hide appropriate color controls, update preview

#### 2. Highlights Color Control
- **Label:** "Highlights"
- **Type:** Color picker with brightness slider
- **Layout:**
  ```
  [■ Color Swatch] ─●──────────── [Brightness]
  ```
- **Swatch Size:** 24px × 24px
- **Click Swatch:** Opens color picker dialog
- **Slider:** Controls brightness/tint intensity
- **Range:** -100 to 100 (0 = normal, positive = brighter, negative = darker)
- **Purpose:** Color for highlight tones in dithering
- **Shows When:** Tonal Mapping includes highlights (1 Color+)

#### 3. Midtones Color Control
- **Label:** "Midtones"
- **Type:** Color picker with brightness slider
- **Same as Highlights**
- **Purpose:** Color for midtone tones
- **Shows When:** Tonal Mapping includes midtones (3 Color+)
- **Visibility:** May be hidden depending on Tonal Mapping selection

#### 4. Shadows Color Control
- **Label:** "Shadows"
- **Type:** Color picker with brightness slider
- **Same as Highlights**
- **Purpose:** Color for shadow tones
- **Shows When:** Tonal Mapping includes shadows (always shown)

#### 5. Background Dropdown
- **Label:** "Background"
- **Type:** Select dropdown
- **Options:**
  - Black (default)
  - White
  - Transparent (if output supports)
  - Custom color

- **Purpose:** Background fill color for non-dithered areas
- **onChange:** Update preview

---

## 🔘 Action Buttons (Bottom of Panel)

### Button Layout

```
┌─────────────────────────────────────────────┐
│  [ CANCEL ]                 [ SAVE/RENDER ]  │
└─────────────────────────────────────────────┘
```

### Button Details

#### CANCEL Button
- **Text:** "CANCEL"
- **Color:** Dark gray background, white text
- **Position:** Bottom left
- **Width:** 45% of panel - 4px gap
- **Height:** 40px
- **Action:** Close dialog without applying
  - Revert all changes
  - Close panel (stay docked)
  - Don't apply to image

#### SAVE / RENDER Button
- **Text:** "SAVE" (when previewing) or "RENDER" (when applying)
- **Color:** Blue/accent color
- **Position:** Bottom right
- **Width:** 45% of panel - 4px gap
- **Height:** 40px
- **State:** Disabled if no active layer
- **Action:** Apply dithering to active layer
  - Create new layer with result
  - Name layer "[Algorithm] [Tonal Map]"
  - Keep original layer
  - Allow undo via Photoshop's undo stack

---

## 🔄 State Management Architecture

### Global State (Zustand Store)

```typescript
interface DitherState {
  // Current settings
  settings: DitherSettings;
  
  // Current tonal mapping
  tonalMapping: TonalMapping;
  
  // Preview state
  previewImage: ImageData | null;
  isProcessing: boolean;
  lastPreviewTime: number;
  
  // UI state
  activeTab: 'render' | 'effect' | 'tonal';
  showPreset: boolean;
  
  // Saved presets
  savedPresets: DitherPreset[];
  
  // Actions
  updateSettings: (partial: Partial<DitherSettings>) => void;
  updateTonalMapping: (mapping: TonalMapping) => void;
  updatePreview: (imageData: ImageData) => void;
  setActiveTab: (tab: string) => void;
  loadPreset: (id: string) => void;
  savePreset: (name: string) => void;
  applyDither: () => Promise<void>;
  cancel: () => void;
}
```

### Settings Type Definition

```typescript
interface DitherSettings {
  // Render Settings
  inputDPI: number;
  resampling: 'preserve' | 'smooth' | 'sharp';
  algorithm: AlgorithmName;
  
  // Effect Controls
  sharpenStrength: number;
  sharpenRadius: number;
  noise: number;
  denoise: number;
  blur: number;
  brightness: number;
  contrast: number;
  
  // Tonal Controls (stored here but shown in tonal tab)
  tonalMappingType: 'singleColor' | '3color' | '5color' | 'custom';
  highlightColor: string; // hex
  midtoneColor: string;
  shadowColor: string;
  backgroundColor: string;
}
```

### TonalMapping Type Definition

```typescript
interface TonalMapping {
  type: 'singleColor' | '3color' | '5color' | 'custom';
  
  colors: {
    highlights: {
      color: string; // hex
      brightness: number; // -100 to 100
    };
    midtones?: {
      color: string;
      brightness: number;
    };
    shadows: {
      color: string;
      brightness: number;
    };
    background: string; // hex or 'black' | 'white' | 'transparent'
  };
}
```

---

## 🔄 Data Flow Diagram

### User Changes Parameter → Preview Updates

```
USER ACTION (Change Slider)
    ↓
ZUSTAND STORE (updateSettings)
    ↓
    ├─→ Update local state
    ├─→ Debounce trigger (300ms)
    └─→ Send to preview processor
    
PREVIEW PROCESSOR (Web Worker)
    ↓
    ├─→ Get current image data from Photoshop
    ├─→ Apply all pre-processing (blur, sharpen, etc)
    ├─→ Convert to working color space (LAB)
    ├─→ Apply selected algorithm
    ├─→ Apply color mapping
    ├─→ Convert back to RGB
    └─→ Return processed ImageData
    
CANVAS PREVIEW
    ↓
    ├─→ Display on preview canvas
    ├─→ Update in real-time
    └─→ Show processing stats (time, colors used)
```

### User Clicks RENDER → Apply to Photoshop

```
USER CLICKS "RENDER"
    ↓
VALIDATION
    ├─→ Check layer exists
    └─→ Check image not too large
    
PREPARE IMAGE
    ├─→ Get full resolution image from active layer
    └─→ Store dimensions and color mode
    
PROCESS IMAGE (Same as preview, but full resolution)
    ├─→ Apply all settings
    ├─→ Process in Web Worker to not block UI
    └─→ Show progress bar
    
APPLY TO PHOTOSHOP
    ├─→ Create new layer
    ├─→ Set pixels on new layer
    ├─→ Name layer appropriately
    └─→ Hide/show original layer based on setting
    
FINISH
    ├─→ Show success message
    ├─→ Enable undo
    └─→ Clear processing state
```

---

## 📊 Component Hierarchy

```
DitherPanel (Main Container)
├── Header
│   ├── Title ("DitheraAI Pro")
│   └── SettingsIcon
│
├── TabNavigation
│   ├── RenderSettingsTab (active)
│   ├── EffectControlsTab
│   └── TonalControlsTab
│
├── TabContent
│   ├── RenderSettingsPanel
│   │   ├── InputDPISlider
│   │   ├── ResamplingDropdown
│   │   ├── AlgorithmDropdown
│   │   └── QuickPresetButtons
│   │
│   ├── EffectControlsPanel
│   │   ├── SharpenStrengthSlider
│   │   ├── SharpenRadiusSlider
│   │   ├── NoiseSlider
│   │   ├── DenoiseSlider
│   │   ├── BlurSlider
│   │   ├── BrightnessSlider
│   │   └── ContrastSlider
│   │
│   └── TonalControlsPanel
│       ├── TonalMappingDropdown
│       ├── HighlightsColorControl
│       ├── MidtonesColorControl
│       ├── ShadowsColorControl
│       └── BackgroundDropdown
│
├── PreviewArea
│   ├── PreviewCanvas
│   ├── ZoomControls
│   └── ProcessingStats
│
└── ActionButtons
    ├── CancelButton
    └── RenderButton
```

---

## 🎯 Real-Time Preview Logic

### Preview Update Strategy

```
Settings Change
    ↓
Queue preview update (debounce 300ms)
    ↓
If already processing: skip
    ↓
Show loading spinner
    ↓
Web Worker processes image
    (happens in background, UI remains responsive)
    ↓
Receive processed ImageData
    ↓
Draw on canvas
    ↓
Update statistics:
  - Processing time
  - Colors used
  - File size estimate
    ↓
Hide loading spinner
```

### Preview Canvas Component

```typescript
interface PreviewCanvasProps {
  imageData: ImageData | null;
  isProcessing: boolean;
  stats?: {
    processingTime: number;
    colorsUsed: number;
    estimatedSize: number;
  };
}

// Features:
// - Fit image to canvas
// - Zoom in/out with mouse wheel
// - Pan with mouse drag
// - Show processing stats
// - Loading indicator while processing
// - Error display if processing fails
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Enter** | Apply (same as RENDER button) |
| **Escape** | Cancel |
| **Ctrl+Z** | Undo (Photoshop built-in) |
| **+** | Zoom in preview |
| **-** | Zoom out preview |
| **0** | Fit preview to canvas |

---

## 🎨 Color & Styling

### Color Palette

```
Background:     #2a2a2a (dark gray)
Text:           #e0e0e0 (light gray)
Accent:         #0d66d0 (blue) - buttons, highlights
Hover:          #0d66d0 + opacity 0.8
Active:         #0d66d0 + opacity 1.0
Error:          #ff4444 (red)
Success:        #44ff44 (green)
Disabled:       #555555 (darker gray)
Border:         #444444 (dark border)
```

### Typography

```
Header:         16px, bold, #e0e0e0
Tab labels:     13px, semi-bold, #e0e0e0
Control labels: 12px, regular, #b0b0b0
Input values:   12px, monospace, #e0e0e0
Help text:      11px, italic, #888888
```

### Spacing

```
Panel padding:        16px
Tab content padding:  12px
Control row height:   28px (label) + 8px (gap) + 24px (control) = 60px
Between controls:     8px vertical, 12px after group
Button height:        40px
Button gap:           8px
```

---

## 🔌 Integration Points

### With Photoshop

1. **Get Active Layer**
   - Read current layer's pixel data
   - Get dimensions and color mode

2. **Get Image Preview**
   - For real-time preview, may use scaled version
   - Web Worker processes in background

3. **Apply Result**
   - Create new layer with dithered result
   - Optionally hide original
   - Add to undo stack

4. **Show UI**
   - Display panel as docked window
   - Listen for layer changes (refresh preview)
   - Listen for document changes

### With Web Workers

1. **Main Thread → Worker**
   ```
   {
     imageData: ImageData,
     settings: DitherSettings,
     tonalMapping: TonalMapping
   }
   ```

2. **Worker → Main Thread**
   ```
   {
     processedImageData: ImageData,
     stats: {
       processingTime: number,
       colorsUsed: number
     }
   }
   ```

---

## 📱 Responsive Behavior

### At Different Panel Widths

- **320px+:** Full layout (current)
- **280px (compact):** Stack controls vertically
- **240px (very compact):** Hide labels, show icons only

*Note: Photoshop panels typically stay at 320px+, so full layout is standard*

---

## 🧪 Testing Considerations

### Unit Tests
- Settings validation (ranges, types)
- Color conversion accuracy
- Slider value clamping

### Integration Tests
- Tab switching maintains state
- Preview updates on settings change
- Button actions trigger correctly
- Undo/redo works

### Manual Tests
- Visual inspection of dithering quality
- Performance with large images
- UI responsiveness during processing
- Color accuracy in preview vs final

---

## 📋 Accessibility

### Keyboard Navigation
- Tab through controls in logical order
- Enter/Space to activate buttons
- Arrow keys to adjust sliders
- Color picker accessible via keyboard

### Screen Readers
- All labels properly associated with inputs
- Tab labels announce content
- Button text is descriptive
- Slider values announced on change

### Visual
- High contrast text on background
- No color-only indicators (always paired with text)
- Icons have text labels
- Disabled state visually obvious

---

## 🚀 Implementation Phases

### Phase 1 (MVP)
- ✅ All 3 tabs layout
- ✅ Render Settings (Input DPI, Resampling, Algorithm dropdown, basic preview)
- ✅ Effect Controls (all 7 sliders)
- ✅ Tonal Controls (basic color mapping)
- ✅ Real-time preview (scaled)
- ✅ Cancel & Render buttons

### Phase 2
- ✅ Quick preset buttons with icons
- ✅ Advanced tonal mapping (3 color, 5 color)
- ✅ Preset save/load system
- ✅ More algorithms
- ✅ Processing statistics

### Phase 3+
- ✅ Animation preview
- ✅ Batch processing UI
- ✅ History panel
- ✅ Advanced color picker integration

---

## 🎯 Key Principles

1. **Real-time Feedback** - Always show user what will happen
2. **Sensible Defaults** - Good results with default settings
3. **Power + Simplicity** - Simple to use, powerful when needed
4. **Responsive** - Never block UI, always responsive
5. **Visual Clarity** - Clear labels, organized layout
6. **Professional** - Match Photoshop design standards

---

**This UI design is production-ready and implements proven patterns from Dithertone Pro, improved based on your design expertise.**

