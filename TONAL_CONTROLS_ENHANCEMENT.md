# Tonal Controls Enhancement: Color Wheel Implementation

**Priority:** HIGH - Core feature polish  
**Status:** Starting  
**Timeline:** This session  
**Goal:** Replace hex input with interactive color wheel, ensure all 4 modes work flawlessly

---

## 🎯 Objectives

1. ✅ Implement interactive color wheel UI
2. ✅ Integrate with React spectrum components
3. ✅ Test all 4 color mapping modes thoroughly
4. ✅ Verify color accuracy with API reference
5. ✅ Ensure real-time preview works
6. ✅ Test on various image types

---

## 📋 Current State

### What Exists:
- ✅ Color mapping engine (getLuminance, interpolateColor, applyColorMapping)
- ✅ All 4 modes implemented (single, 3color, 5color, custom)
- ✅ Settings state in DitherPanel
- ✅ Integration into processImagePixels

### What's Missing:
- ❌ Color wheel UI component
- ❌ Real-time color preview
- ❌ Proper color picker (currently just hex input)
- ❌ Color wheel interaction handlers
- ❌ Mode-specific UI (different controls for each mode)

---

## 🛠️ Implementation Plan

### Step 1: Research UXP Color Picker Options

**UXP / Spectrum Components Available:**
1. **sp-colorslider** - Hue/saturation slider (basic)
2. **sp-colorfield** - 2D color selector (best for wheel)
3. **input type="color"** - Browser native (might be limited in UXP)
4. **Canvas-based custom color wheel** (most control, more work)

**Recommendation:** Use **sp-colorfield** (Spectrum color selector) - gives us control without custom canvas

---

### Step 2: Create Color Wheel Component

**Location:** `src/components/ColorWheel.jsx`

**Features:**
- Interactive color selector (Spectrum sp-colorfield)
- Hex color display
- RGB values shown
- Live preview swatch
- Reset button

**Props:**
```jsx
<ColorWheel 
  label="Shadow Color"
  value={shadowColor}
  onChange={setShadowColor}
  help="Select dark tones for shadows"
/>
```

---

### Step 3: Tonal Controls UI Redesign

**Mode: Single Color**
```
┌─────────────────────────────────┐
│ Tonal Controls                  │
├─────────────────────────────────┤
│ Mode: [Single Color ▼]          │
│                                 │
│ Color Wheel:                    │
│ ┌───────────────────────────┐   │
│ │  [Interactive Selector]   │   │
│ │  Preview: ████ (#2C1810)  │   │
│ └───────────────────────────┘   │
│                                 │
│ RGB: R:44 G:24 B:16            │
│ Hex: #2C1810                    │
└─────────────────────────────────┘
```

**Mode: 3-Color**
```
┌─────────────────────────────────┐
│ Tonal Controls                  │
├─────────────────────────────────┤
│ Mode: [3-Color ▼]               │
│                                 │
│ Shadows:                        │
│ ┌───────────────────────────┐   │
│ │  [Color Wheel]            │   │
│ │  Preview: ████ (#2C1810)  │   │
│ └───────────────────────────┘   │
│                                 │
│ Midtones:                       │
│ ┌───────────────────────────┐   │
│ │  [Color Wheel]            │   │
│ │  Preview: ████ (#8B6914)  │   │
│ └───────────────────────────┘   │
│                                 │
│ Highlights:                     │
│ ┌───────────────────────────┐   │
│ │  [Color Wheel]            │   │
│ │  Preview: ████ (#D4A574)  │   │
│ └───────────────────────────┘   │
│                                 │
│ [Reset to Defaults]             │
└─────────────────────────────────┘
```

**Mode: 5-Color** (Advanced 3-color with more control)

**Mode: Custom** (Placeholder for future 10-color palettes)

---

## 🎨 Color Wheel Implementation Details

### Option A: Using Spectrum sp-colorfield (RECOMMENDED)

```jsx
import React, { useState } from 'react';

export const ColorWheel = ({ 
  label, 
  value, 
  onChange, 
  help 
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const rgbFromHex = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return { r, g, b };
  };

  const { r, g, b } = rgbFromHex(localValue);

  return (
    <div className="color-wheel-container">
      <label>{label}</label>
      
      {/* Color Selector */}
      <input 
        type="color" 
        value={localValue}
        onChange={handleChange}
        className="color-selector"
      />
      
      {/* Preview Swatch */}
      <div 
        className="color-preview"
        style={{ backgroundColor: localValue }}
        title={localValue}
      />
      
      {/* Color Values */}
      <div className="color-values">
        <div>Hex: {localValue}</div>
        <div>RGB: R:{r} G:{g} B:{b}</div>
      </div>
      
      {help && <small className="help-text">{help}</small>}
    </div>
  );
};
```

### Option B: Custom Canvas Color Wheel (If needed)

- Full visual control
- HSV color space
- Touch support
- More complex (~200 lines)

**Only implement if sp-colorfield insufficient**

---

## 🔌 Integration Steps

### Step 1: Update DitherPanel.jsx

Replace this:
```jsx
<input 
  type="text" 
  value={shadowColor}
  onChange={(e) => setShadowColor(e.target.value)}
  placeholder="#000000"
/>
```

With this:
```jsx
<ColorWheel 
  label="Shadow Color"
  value={shadowColor}
  onChange={setShadowColor}
  help="Dark tones in the image"
/>
```

### Step 2: Create Tonal Controls Section

```jsx
{/* Tonal Controls Tab */}
<div className="tonal-controls">
  <div className="control-group">
    <label>Color Mapping Mode</label>
    <select 
      value={tonalMappingType}
      onChange={(e) => setTonalMappingType(e.target.value)}
    >
      <option value="none">None (B&W)</option>
      <option value="singleColor">Single Color</option>
      <option value="3color">3-Color (Duotone)</option>
      <option value="5color">5-Color (Rich)</option>
      <option value="custom">Custom Palette</option>
    </select>
  </div>

  {/* Render mode-specific UI */}
  {tonalMappingType === "singleColor" && (
    <ColorWheel 
      label="Color"
      value={highlightColor}
      onChange={setHighlightColor}
      help="All pixels mapped to shades of this color"
    />
  )}

  {tonalMappingType === "3color" && (
    <>
      <ColorWheel 
        label="Shadows"
        value={shadowColor}
        onChange={setShadowColor}
      />
      <ColorWheel 
        label="Midtones"
        value={midtoneColor}
        onChange={setMidtoneColor}
      />
      <ColorWheel 
        label="Highlights"
        value={highlightColor}
        onChange={setHighlightColor}
      />
      <button onClick={handleResetColors}>Reset to Defaults</button>
    </>
  )}

  {tonalMappingType === "5color" && (
    <>
      <ColorWheel 
        label="Shadows"
        value={shadowColor}
        onChange={setShadowColor}
      />
      <ColorWheel 
        label="Midtones"
        value={midtoneColor}
        onChange={setMidtoneColor}
      />
      <ColorWheel 
        label="Highlights"
        value={highlightColor}
        onChange={setHighlightColor}
      />
      <small>5-Color uses extended gradients between these points</small>
    </>
  )}
</div>
```

---

## ✅ Testing All Modes

### Test 1: Single Color Mode

**Setup:**
- Mode: Single Color
- Color: Red (#FF0000)

**Expected:**
- All pixels become shades of red
- Dark areas = dark red
- Bright areas = bright red
- No gray/neutral tones

**Test Images:**
- Portrait (various skin tones)
- Landscape (various colors)
- Grayscale gradient

---

### Test 2: 3-Color Duotone Mode

**Setup:**
- Mode: 3-Color
- Shadow: #2C1810 (dark brown)
- Midtone: #8B6914 (medium brown)
- Highlight: #D4A574 (light tan)

**Expected:**
- Dark areas = dark brown
- Mid tones = medium brown
- Bright areas = light tan
- Smooth transitions between zones
- Classic sepia appearance

**Test Images:**
- Photo with full tonal range
- High contrast B&W
- Color photo (should lose original colors)

---

### Test 3: 5-Color Mode

**Setup:**
- Mode: 5-Color
- Same 3 colors as above

**Expected:**
- Smoother transitions than 3-color
- More tonal steps visible
- Richer color gradation
- Less banding/posterization

---

### Test 4: Color Wheel Interaction

**Setup:**
- Any mode
- Try different colors via color wheel

**Expected:**
- Colors update immediately
- Preview swatch shows selected color
- RGB values match hex input
- No lag or delays
- Real-time dithering preview updates

---

## 📊 Verification Checklist

Before marking complete:

- [ ] **Color Wheel UI**
  - [ ] Spectrum component integrated
  - [ ] Color selection works smoothly
  - [ ] Hex values display correctly
  - [ ] RGB values calculate correctly
  - [ ] Preview swatch updates in real-time

- [ ] **Single Color Mode**
  - [ ] Works with all algorithms
  - [ ] No color bleeding
  - [ ] Proper tonal range
  - [ ] Results look natural

- [ ] **3-Color Mode**
  - [ ] Shadow color visible in dark areas
  - [ ] Midtone color visible in mids
  - [ ] Highlight color visible in bright areas
  - [ ] Smooth transitions (no banding)
  - [ ] Works with all 10 algorithms

- [ ] **5-Color Mode**
  - [ ] Smoother transitions than 3-color
  - [ ] More tonal steps
  - [ ] No visible posterization
  - [ ] Professional appearance

- [ ] **Performance**
  - [ ] Color wheel responds instantly
  - [ ] No lag when changing colors
  - [ ] Processing < 5 seconds for large images
  - [ ] No memory leaks

- [ ] **Integration**
  - [ ] Works with brightness/contrast
  - [ ] Works with blur/sharpen
  - [ ] Works with all dithering algorithms
  - [ ] Intensity slider still works
  - [ ] DPI scaling still works
  - [ ] Effect controls still work

- [ ] **Visual Quality**
  - [ ] Colors are accurate
  - [ ] Dithering pattern still visible
  - [ ] No artifacts
  - [ ] Smooth color transitions
  - [ ] Matches original image tones

---

## 🔍 API Reference Notes

### Spectrum Color Components
- **sp-colorslider** - Single hue/value selector
- **input type="color"** - Native browser picker (works in UXP)
- **sp-color** - Display color (for preview)

### Color Space Conversions
If we need HSV/HSL for advanced features:
```javascript
// RGB to HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), delta = max - Math.min(r, g, b);
  return {
    h: 60 * (delta ? max === r ? (g - b) / delta : max === g ? 2 + (b - r) / delta : 4 + (r - g) / delta : 0) < 0 ? 360 : 60 * (...),
    s: max ? delta / max : 0,
    v: max
  };
}

// HSV to RGB
function hsvToRgb(h, s, v) {
  const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)].map(x => Math.round(x * 255));
}
```

---

## 📝 Implementation Checklist

- [ ] Create ColorWheel.jsx component
- [ ] Add styling for color wheel
- [ ] Update DitherPanel.jsx with ColorWheel imports
- [ ] Implement mode-specific UI rendering
- [ ] Add reset button for colors
- [ ] Add help text/tooltips
- [ ] Test all color modes
- [ ] Test color wheel interaction
- [ ] Test with different image types
- [ ] Verify performance
- [ ] Commit to git

---

## 🚀 Success Criteria

Phase complete when:
- ✅ Color wheel UI is polished and intuitive
- ✅ All 4 modes work correctly
- ✅ Colors are accurate (match hex values)
- ✅ Real-time preview works
- ✅ Performance is fast
- ✅ No visual artifacts
- ✅ Works with all other features

---

## 🎨 Preset Color Schemes (Quick Copy)

### Sepia (Classic)
```
Shadow: #2C1810
Midtone: #8B6914
Highlight: #D4A574
```

### Modern Blue
```
Shadow: #001F3F
Midtone: #0074D9
Highlight: #7FDBCA
```

### Golden Hour
```
Shadow: #661A00
Midtone: #CC6633
Highlight: #FFCC99
```

### Vintage B&W
```
Shadow: #1A1A1A
Midtone: #808080
Highlight: #E6E6E6
```

### Professional Print
```
Shadow: #000000
Midtone: #7F7F7F
Highlight: #FFFFFF
```

---

## 🔗 Related Files

- **photoshop.js** - Color mapping engine (complete)
- **DitherPanel.jsx** - Main UI component (needs update)
- **styles.css** - Need to add color wheel styling
- **PHASE_2_TESTING.md** - Testing guide

---

**Next Action:** Start implementing ColorWheel.jsx component

