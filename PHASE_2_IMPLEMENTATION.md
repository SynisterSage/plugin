# Phase 2: Color Mapping & Advanced Features Implementation

**Status:** Starting  
**Timeline:** Weeks 7-12 (4-6 weeks)  
**MVP Target:** Weeks 7-8 (Color Mapping first)  
**Reference:** ROADMAP.md Phase 2 section

---

## 🎯 Phase 2 Overview

Phase 2 transforms the basic dithering plugin into a **professional-grade color mapping tool** with artistic capabilities. This is the "WOW FACTOR" that differentiates from competitors.

### Core Goals:
1. ✅ Implement color mapping system (luminance → user colors)
2. ⏳ Support 4 color mapping modes (single, 3-color, 5-color, custom)
3. ⏳ Create preset system for saving/loading settings
4. ⏳ Enhance real-time preview
5. ⏳ Add 5+ additional dithering algorithms (already exist, just optimize)

### Success Criteria:
- ✅ Color mapping produces expected tonal results
- ✅ All modes (1/3/5/custom) work correctly
- ✅ Presets save/load without data loss
- ✅ UI responsive with real-time feedback
- ✅ Works with all 10 dithering algorithms

---

## 📋 Implementation Roadmap

### Week 7: Color Mapping Engine ⏳ (YOU ARE HERE)

**Deliverable:** Fully functional color mapping that transforms dithered patterns into colorized overlays

#### 7.1 Color Mapping Core
- [ ] Implement `getLuminance(r, g, b)` - Perceptual brightness calculation
- [ ] Implement `interpolateColor(color1, color2, position)` - RGB color blending
- [ ] Implement `applyColorMapping(pixels, width, height, mode, colors)` - Main engine
- [ ] Wire into `processImagePixels()` pipeline
- [ ] Test all 4 mapping modes

#### 7.2 UI Integration
- [ ] Add Tonal Controls tab to DitherPanel
- [ ] Create color picker components for highlights/midtones/shadows
- [ ] Add mode selector dropdown (1/3/5/Custom)
- [ ] Add live preview of color mapping
- [ ] Add reset button

#### 7.3 Testing & Optimization
- [ ] Test on small, medium, large images
- [ ] Profile memory usage
- [ ] Verify color accuracy
- [ ] Test with different image types (photos, graphics, patterns)

---

### Week 8: Preset System & Polish

- [ ] Local storage API setup
- [ ] Save preset dialog
- [ ] Load preset functionality
- [ ] Delete preset confirmation
- [ ] Default presets (Sepia, Duotone, Vintage, etc.)

---

### Week 9-10: Additional Algorithms & Export

- [ ] Optimize remaining algorithms (already exist)
- [ ] Add export format options
- [ ] Implement batch processing UI

---

### Week 11-12: Real-time Preview & Performance

- [ ] Canvas-based preview implementation
- [ ] Zoom controls
- [ ] Performance optimization (Web Workers)

---

## 🛠️ Implementation Details

### Step 1: Color Mapping Engine (photoshop.js)

#### 1.1 getLuminance() Function

```javascript
/**
 * Calculate perceptual luminance of a color
 * Uses ITU-R BT.709 standard for better human perception
 * Returns 0-255 range representing brightness
 */
function getLuminance(r, g, b) {
    // ITU-R BT.709: More accurate than simple average
    // Red is weighted more heavily because human eyes are more sensitive to red
    return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}
```

#### 1.2 interpolateColor() Function

```javascript
/**
 * Interpolate between two colors
 * position: 0 (color1) to 1 (color2)
 * Returns [r, g, b]
 */
function interpolateColor(color1, color2, position) {
    // Ensure position is 0-1
    position = Math.max(0, Math.min(1, position));
    
    const r1 = parseInt(color1.substr(1, 2), 16);
    const g1 = parseInt(color1.substr(3, 2), 16);
    const b1 = parseInt(color1.substr(5, 2), 16);
    
    const r2 = parseInt(color2.substr(1, 2), 16);
    const g2 = parseInt(color2.substr(3, 2), 16);
    const b2 = parseInt(color2.substr(5, 2), 16);
    
    return [
        Math.round(r1 + (r2 - r1) * position),
        Math.round(g1 + (g2 - g1) * position),
        Math.round(b1 + (b2 - b1) * position)
    ];
}
```

#### 1.3 applyColorMapping() Function

```javascript
/**
 * Main color mapping function
 * Maps pixel luminance to color palette
 */
function applyColorMapping(pixels, width, height, mode, settings) {
    const colorMap = {};
    
    // Build color palette based on mode
    if (mode === "singleColor") {
        // All pixels become shades of selected color
        for (let lum = 0; lum <= 255; lum++) {
            const ratio = lum / 255;
            const [r, g, b] = interpolateColor("#000000", settings.highlightColor, ratio);
            colorMap[lum] = [r, g, b];
        }
    } else if (mode === "3color") {
        // Map: shadows → midtones → highlights
        for (let lum = 0; lum <= 255; lum++) {
            if (lum < 85) {
                // Dark third: shadow to midtone
                const ratio = lum / 85;
                const [r, g, b] = interpolateColor(settings.shadowColor, settings.midtoneColor, ratio);
                colorMap[lum] = [r, g, b];
            } else if (lum < 170) {
                // Mid third: midtone to highlight
                const ratio = (lum - 85) / 85;
                const [r, g, b] = interpolateColor(settings.midtoneColor, settings.highlightColor, ratio);
                colorMap[lum] = [r, g, b];
            } else {
                // Light third: highlight (stay constant)
                const [r, g, b] = interpolateColor(settings.highlightColor, settings.highlightColor, 1);
                colorMap[lum] = [r, g, b];
            }
        }
    } else if (mode === "5color") {
        // 5-point gradient: implement similar to 3-color but with more points
        // ... implementation
    }
    
    // Apply color map to pixels
    for (let i = 0; i < pixels.length; i += 4) {
        const lum = getLuminance(pixels[i], pixels[i + 1], pixels[i + 2]);
        const [r, g, b] = colorMap[lum] || [0, 0, 0];
        
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        // Alpha channel remains unchanged (from dithering overlay)
    }
}
```

---

### Step 2: UI Integration (DitherPanel.jsx)

The Tonal Controls section already exists in DitherPanel with these states:
- `tonalMappingType` - "singleColor" | "3color" | "5color" | "custom"
- `highlightColor` - hex string
- `midtoneColor` - hex string
- `shadowColor` - hex string

**Next Steps:**
1. Add UI for mode selection
2. Add color pickers
3. Wire to renderDitheredResult

---

## 🎨 Color Mapping Modes Explained

### Mode 1: Single Color (Monochrome)
Maps all pixels to shades of a single color.
- Shadow → (black at 0 luminance)
- Midtone → (selected color at 128 luminance)
- Highlight → (selected color at 255 luminance)

**Use Case:** Classic B&W dithering, Vintage prints

### Mode 2: 3-Color (Duotone/Tritone)
Maps pixels across three color points.
- Shadow (0%) → Dark point
- Midtone (50%) → Middle point
- Highlight (100%) → Light point

**Use Case:** Duotone prints, Artistic effects, Sepia tones

### Mode 3: 5-Color (Rich Gradient)
Maps pixels across five color points for smoother transitions.
- Shadow (0%)
- Dark Midtone (25%)
- Midtone (50%)
- Light Midtone (75%)
- Highlight (100%)

**Use Case:** Complex color grading, Professional prints

### Mode 4: Custom (Advanced)
User defines up to 10 color points for maximum control.

**Use Case:** Specific brand colors, Artistic vision

---

## 📊 Integration Points

### In processImagePixels():

```javascript
function processImagePixels(pixels, width, height, settings) {
    // ... existing code (brightness, contrast, effects, dithering) ...
    
    // NEW: Apply color mapping AFTER dithering but BEFORE overlay
    if (settings.tonalMappingType !== "none") {
        applyColorMapping(pixels, width, height, settings.tonalMappingType, {
            shadowColor: settings.shadowColor,
            midtoneColor: settings.midtoneColor,
            highlightColor: settings.highlightColor
        });
    }
    
    // ... then createDitheringOverlay() as before ...
    
    return pixels;
}
```

---

## ✅ Testing Checklist

- [ ] Single color mode produces monochrome output
- [ ] 3-color mode produces smooth transitions
- [ ] 5-color mode produces rich gradients
- [ ] Custom mode works with user colors
- [ ] Works with all 10 algorithms
- [ ] Works with all effect controls
- [ ] Large image (2000x2000) completes in <5 seconds
- [ ] Colors remain accurate with different color profiles
- [ ] No memory leaks on repeated operations

---

## 🚀 Quick Start

1. **Implement getLuminance()** - 2 min
2. **Implement interpolateColor()** - 3 min
3. **Implement applyColorMapping()** - 15 min
4. **Test with sample image** - 5 min
5. **Polish UI** - 10 min

**Total: ~35 minutes for MVP**

---

## 📚 Reference Materials

- ITU-R BT.709 Luminance Formula: `0.2126*R + 0.7152*G + 0.0722*B`
- Duotone Color Combinations:
  - Sepia: Shadow #2C1810, Highlight #D4A574
  - Modern Blue: Shadow #001F3F, Highlight #7FDBCA
  - Vintage: Shadow #8B4513, Highlight #FFD700

---

## 🎯 Success Indicators

When Phase 2 is complete:
- ✅ Users can colorize dithered patterns
- ✅ Multiple color modes available
- ✅ Results look professional
- ✅ Performance is fast even on large images
- ✅ Feature is discoverable and intuitive in UI

---

**Next Action:** Start implementing color mapping engine functions in photoshop.js

