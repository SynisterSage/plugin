# DitheraAI Pro - Architecture & Technical Design

**Document Purpose:** Deep dive into how the plugin works, what components talk to what, and how data flows

---

## 📐 System Architecture

### High-Level Overview

```
USER INTERFACE (React Components)
        ↕
STATE MANAGEMENT (Zustand)
        ↕
BUSINESS LOGIC (Algorithm Engine)
        ↕
PHOTOSHOP BRIDGE (UXP Services)
        ↕
PHOTOSHOP APPLICATION
        ↕
USER'S IMAGE DATA (Pixels, Layers)
```

### Detailed Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    UXP PANEL (in Photoshop)                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Root Component                    │   │
│  │              <DitherPanel />                         │   │
│  └─────────────────────────────────────────────────────┘   │
│           ▲                                    ▼             │
│  ┌─────────────────┐                ┌─────────────────┐    │
│  │  Algorithm UI   │                │   Preview UI    │    │
│  │  Selector       │                │   Canvas        │    │
│  └─────────────────┘                └─────────────────┘    │
│           ▲                                    ▲             │
│           │                                    │             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Parameter Sliders Component                │    │
│  │  - Intensity                                       │    │
│  │  - Color Depth                                     │    │
│  │  - Threshold                                       │    │
│  │  - Blur/Sharpen                                    │    │
│  │  - Brightness/Contrast                             │    │
│  └────────────────────────────────────────────────────┘    │
│                        ▲                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Zustand Store (State)                    │    │
│  │  - currentSettings: DitherSettings                 │    │
│  │  - previewImage: ImageData                         │    │
│  │  - isProcessing: boolean                           │    │
│  │  - savedPresets: DitherPreset[]                    │    │
│  └────────────────────────────────────────────────────┘    │
│                        ▲                                     │
└────────────────────────────────────────────────────────────┘
        ▲ ▼ (UI ↔ Logic)
┌────────────────────────────────────────────────────────────┐
│                  ALGORITHM ENGINE                           │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │      Algorithm Registry / Factory                │     │
│  │  • getAlgorithm(name) → Algorithm instance     │     │
│  └──────────────────────────────────────────────────┘     │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Algorithm Implementations                │     │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │     │
│  │  │Floyd-      │  │Ordered     │  │Adaptive  │  │     │
│  │  │Steinberg   │  │Dithering   │  │(Yours)   │  │     │
│  │  └────────────┘  └────────────┘  └──────────┘  │     │
│  └──────────────────────────────────────────────────┘     │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │    Image Processing Pipeline                     │     │
│  │  1. Extract pixel data                          │     │
│  │  2. Convert color space (RGB → LAB/HSV)         │     │
│  │  3. Apply pre-processing (blur, sharpen)        │     │
│  │  4. Apply color mapping                         │     │
│  │  5. Run dithering algorithm                     │     │
│  │  6. Convert back to RGB                         │     │
│  │  7. Return processed ImageData                  │     │
│  └──────────────────────────────────────────────────┘     │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │    Web Workers (for heavy lifting)               │     │
│  │  • Main thread handles UI                       │     │
│  │  • Worker threads process images                │     │
│  │  • Non-blocking performance                     │     │
│  └──────────────────────────────────────────────────┘     │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │    Utility Modules                               │     │
│  │  • colorSpace.ts (RGB ↔ LAB/HSV)               │     │
│  │  • imageUtils.ts (getPixels, setPixels)         │     │
│  │  • math.ts (matrix ops, quantization)           │     │
│  │  • storage.ts (localStorage for presets)        │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
        ▲ ▼ (Call UXP APIs)
┌────────────────────────────────────────────────────────────┐
│              PHOTOSHOP SERVICES LAYER                       │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  photoshop.ts - UXP Bridge                       │     │
│  │  • getActiveLayer()                             │     │
│  │  • getImageData(layer) → ImageData              │     │
│  │  • setImageData(layer, data) → void             │     │
│  │  • createNewLayer(name) → Layer                 │     │
│  │  • applyFilter(command) → void (batchPlay)      │     │
│  │  • executeCommand(action) → void                │     │
│  └──────────────────────────────────────────────────┘     │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Photoshop DOM / batchPlay API                   │     │
│  │  • Access to all Photoshop features             │     │
│  │  • Layer manipulation                           │     │
│  │  • Image operations                             │     │
│  │  • Document structure                           │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
        ▲ ▼
┌────────────────────────────────────────────────────────────┐
│              ADOBE PHOTOSHOP APPLICATION                    │
│  • Document                                                │
│  • Layers                                                  │
│  • Pixel Data                                              │
│  • Undo Stack                                              │
│  • Color Management                                        │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: How An Image Gets Dithered

### Step-by-Step: User clicks "Apply"

```
USER CLICKS "APPLY"
    ↓
┌─────────────────────────────────────────┐
│ 1. UI Dispatch Action                   │
│    store.dither(settings)               │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 2. Get Image Data                       │
│    photoshop.getImageData(activeLayer)  │
│    Returns: ImageData {                 │
│      width: 2000,                       │
│      height: 1500,                      │
│      data: Uint8ClampedArray(RGBA)     │
│    }                                    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 3. Send to Web Worker                   │
│    worker.postMessage({                 │
│      imageData,                         │
│      settings,                          │
│      algorithm: 'floyd-steinberg'       │
│    })                                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 4. Pre-processing (in Worker)           │
│    • Blur if needed                     │
│    • Sharpen if needed                  │
│    • Adjust brightness/contrast         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 5. Color Space Conversion               │
│    RGB → LAB (for better perception)   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 6. Color Quantization                   │
│    • Reduce to N colors (e.g., 16)     │
│    • Use octree or median cut           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 7. Apply Dithering Algorithm            │
│    • Floyd-Steinberg: diffuse error     │
│    • Pattern: distribute error to       │
│      neighboring pixels                 │
│    • Result: dithered image in indexed  │
│      color                              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 8. Color Mapping (Optional)             │
│    • Map indexed colors to user-        │
│      selected palette                   │
│    • Apply shadow/midtone/highlight     │
│      specific colors                    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 9. Convert Back to RGB                  │
│    LAB → RGB (for display/export)      │
│    Result: RGBA ImageData               │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 10. Send Result from Worker             │
│     worker.onmessage({                  │
│       processedImageData,               │
│       stats: {                          │
│         processingTime,                 │
│         colorsUsed,                     │
│         etc                             │
│       }                                 │
│     })                                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 11. Update Preview                      │
│     • Canvas shows result               │
│     • Display processing stats          │
│     • Update UI state                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 12. User Reviews Result                 │
│     • If good: clicks "Apply"           │
│     • If bad: adjusts sliders           │
└─────────────────────────────────────────┘
    ↓
IF USER CONFIRMS:
    ↓
┌─────────────────────────────────────────┐
│ 13. Apply to Photoshop Layer            │
│     photoshop.setImageData(             │
│       activeLayer,                      │
│       processedImageData                │
│     )                                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 14. Success!                            │
│     Layer is now dithered               │
│     User can undo with Ctrl+Z           │
└─────────────────────────────────────────┘
```

---

## 💾 File Structure & Module Responsibilities

### `src/index.tsx` - Entry Point
**Responsibility:** Initialize React app, mount to DOM
**Size:** ~50 lines
**Dependencies:** React, ReactDOM
```typescript
// Boots the app, sets up React root
```

### `src/components/DitherPanel.tsx` - Main UI Container
**Responsibility:** Top-level component, orchestrate all UI pieces
**Size:** ~200 lines
**Handles:** Layout, tab switching, main actions
```
DitherPanel
├── Header
├── Tabs (Settings / Preview / Presets)
├── SettingsTab
│   ├── AlgorithmSelector
│   ├── ParameterSliders
│   └── PresetButtons
├── PreviewTab
│   └── PreviewCanvas
├── PresetsTab
│   └── PresetManager
└── Footer (Apply/Cancel buttons)
```

### `src/components/ParameterSliders.tsx` - All Adjustment Controls
**Responsibility:** Render sliders, handle value changes
**Size:** ~300 lines
**Parameters:**
- Intensity (0-100)
- Color Depth (2-256)
- Threshold (0-255)
- Blur Radius (0-50)
- Sharpen Amount (0-100)
- Brightness (-100 to 100)
- Contrast (-100 to 100)

### `src/components/PreviewCanvas.tsx` - Live Preview
**Responsibility:** Display processed image in real-time
**Size:** ~150 lines
**Features:**
- Canvas element for image display
- Zoom in/out controls
- Real-time update as settings change
- Performance metrics display

### `src/algorithms/` - Dithering Implementations

#### `src/algorithms/base.ts` - Abstract Algorithm
```typescript
interface Algorithm {
  name: string;
  process(
    imageData: ImageData,
    settings: DitherSettings,
    colorMap: Uint8Array
  ): ImageData;
}
```

#### `src/algorithms/floyd-steinberg.ts` (Phase 1)
- Classic error diffusion algorithm
- ~100 lines of optimized code
- Best quality/performance trade-off

#### `src/algorithms/ordered.ts` (Phase 2)
- Bayer matrix dithering
- Multiple pattern sizes (2x2, 4x4, 8x8)
- ~80 lines

#### `src/algorithms/adaptive.ts` (Phase 2 - YOUR INNOVATION)
- Edge detection + pattern selection
- Applies different dithering based on local contrast
- ~150 lines (complex!)
- **This is your competitive advantage**

### `src/services/photoshop.ts` - UXP Bridge
**Responsibility:** Wrapper around Photoshop APIs
**Size:** ~200 lines
**Key Methods:**
```typescript
export async function getActiveLayer(): Promise<Layer>
export async function getImageData(layer: Layer): Promise<ImageData>
export async function setImageData(layer: Layer, data: ImageData): Promise<void>
export async function createNewLayer(name: string): Promise<Layer>
export async function executeCommand(action: any): Promise<void>
```

### `src/utils/colorSpace.ts` - Color Conversions
**Responsibility:** RGB ↔ LAB, HSV, etc.
**Size:** ~150 lines
**Used For:** Perceptually accurate color operations
```typescript
export function rgbToLab(r: number, g: number, b: number): [L, a, b]
export function labToRgb(l: number, a: number, b: number): [r, g, b]
export function quantizeColors(imageData: ImageData, numColors: number): Uint8Array
```

### `src/utils/imageUtils.ts` - Image Operations
**Responsibility:** Pixel manipulation, convolution, etc.
**Size:** ~200 lines
```typescript
export function getPixelRGBA(imageData: ImageData, x: number, y: number): [r, g, b, a]
export function setPixelRGBA(imageData: ImageData, x: number, y: number, rgba: [r, g, b, a]): void
export function applyBlur(imageData: ImageData, radius: number): ImageData
export function applySharpen(imageData: ImageData, amount: number): ImageData
```

### `src/utils/storage.ts` - Preset Persistence
**Responsibility:** Save/load presets to localStorage
**Size:** ~100 lines
```typescript
export function savePreset(preset: DitherPreset): void
export function loadPresets(): DitherPreset[]
export function deletePreset(id: string): void
```

### `src/types/index.ts` - All Type Definitions
**Responsibility:** Centralized TypeScript types
**Size:** ~200 lines
```typescript
export interface DitherSettings { ... }
export interface ColorMapping { ... }
export interface DitherPreset { ... }
export interface ImageData { ... }
export type AlgorithmName = 'floyd-steinberg' | 'ordered' | ...
```

---

## 🔧 Technology Stack Details

### Why React?
- You know it deeply
- UXP has good React support
- Component-based UI is perfect for this
- Easy to test
- Large ecosystem

### Why Zustand for State?
- Lightweight (not Redux overkill)
- Easy to learn
- Perfect for plugin size constraints
- No boilerplate
- Good DevTools support

### Why TypeScript?
- Catch bugs at compile time
- Better IDE support
- Easier to refactor
- Great for algorithms with precise types
- Professional-grade code

### Why Web Workers?
- Dithering is CPU-intensive
- Blocks UI without workers
- Plugin must stay responsive
- Parallel processing for batch ops

---

## ⚡ Performance Considerations

### Challenge: Large Images
- 50MP image = 200MB of data in memory
- Dithering is O(n) but with high constants

### Solutions
1. **Tiled Processing** - Process image in chunks
2. **Preview at Reduced Size** - Show preview at 50%, full at apply
3. **Web Workers** - Non-blocking processing
4. **Typed Arrays** - `Uint8ClampedArray` vs regular arrays
5. **Algorithm Optimization** - Vectorization where possible

### Performance Targets
- Preview update: <500ms
- Full image process: <5s (50MP)
- Real-time parameter adjustment: smooth 60 FPS preview

---

## 🧪 Testing Strategy

### Unit Tests (Phase 4)
```
algorithms/
├── floyd-steinberg.test.ts      # Test algorithm correctness
├── ordered.test.ts              # Test ordered dithering
└── colorSpace.test.ts           # Test color conversions

utils/
├── imageUtils.test.ts           # Test image ops
└── storage.test.ts              # Test preset save/load
```

### Integration Tests (Phase 4)
```
services/
└── photoshop.test.ts            # Test Photoshop API integration
```

### Manual Tests (Phases 1-4, ongoing)
- Visual inspection of dithering output
- Performance benchmarks on various image sizes
- User experience testing with real workflows

---

## 🔐 Security & Permissions

### UXP Permissions Needed
```json
{
  "requiredPermissions": [
    "webview",              // For rendering UI
    "localFileSystem",      // For saving presets to storage
    "allowCodeGenerationFromStrings"  // For dynamic algorithms (if needed)
  ]
}
```

### No Network Access (Phase 1-4)
- Won't need network for MVP
- Phase 2.5 might add AI (requires network permission)
- All processing is local (privacy!)

---

## 🔄 Extension Points (For Future Phases)

### Phase 2.5: AI Color Palettes
```
┌─────────────────┐
│ Image Analysis  │
└────────┬────────┘
         ↓
┌─────────────────────────────┐
│ Send to API (Replicate?)    │
│ or local ML model           │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│ Get Suggested Palette       │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│ Apply to Plugin UI          │
└─────────────────────────────┘
```

### Phase 3: Batch Processing
```
┌──────────────────────────────────┐
│ User selects multiple layers     │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Queue system (use Web Workers)   │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Process each layer with settings │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Write results to new layers      │
└──────────────────────────────────┘
```

---

## 📊 Metrics & Telemetry (Phase 5+)

Consider tracking (always with user consent):
- Which algorithms are most popular
- Typical parameter values
- Most common file sizes processed
- Feature usage
- Performance stats

This helps you:
- Optimize for real usage
- Prioritize new features
- Fix performance bottlenecks

---

## 🎨 Design Principles

### UX Philosophy
1. **Simplicity First** - Advanced users can explore presets/sliders
2. **Feedback Always** - Show preview, stats, progress
3. **No Hidden State** - User always knows what's happening
4. **Keyboard Support** - No mouse-only interactions
5. **Dark Mode Ready** - Works in light and dark Photoshop

### Code Philosophy
1. **Readable > Clever** - Maintainable code wins
2. **Modular** - Small, focused functions
3. **Type Safe** - TypeScript catches errors
4. **Well Tested** - Unit tests for algorithms
5. **Documented** - Comments where logic isn't obvious

---

**This architecture guide is reference material. Don't memorize it—bookmark and return to it as you build.**

