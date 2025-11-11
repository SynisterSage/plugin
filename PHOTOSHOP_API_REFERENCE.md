# Photoshop UXP Imaging API Reference

## Overview
The Photoshop Imaging API allows JavaScript plugins to read and manipulate pixel data in Photoshop documents. This document serves as a quick reference for the DitheraAI Pro plugin.

## Core Concepts

### PhotoshopImageData
- Instance returned from imaging API methods
- Contains actual pixel data
- Must be disposed after use to free memory
- Cannot be created explicitly - only returned from API calls

### Color Spaces & Profiles
- **RGB**: Most common, use `"sRGB IEC61966-2.1"` profile
- **Grayscale**: Use `"Gray Gamma 2.2"` profile  
- **Lab**: Uses `"Lab D50"` profile
- For 32-bit images, remove "(Linear RGB Profile)" text from profile name

### Pixel Data Formats
- **Chunky** (default): `[R1, G1, B1, A1, R2, G2, B2, A2, ...]`
- **Planar**: `[R1, R2, ..., G1, G2, ..., B1, B2, ..., A1, A2, ...]`
- Components: 1 (grayscale), 2 (grayscale+alpha), 3 (RGB), 4 (RGBA)
- 8-bit: `Uint8Array` (0-255)
- 16-bit: `Uint16Array` (0-32768 or 0-65535 with fullRange)
- 32-bit: `FloatArray` (0-1.0)

---

## Key APIs

### 1. `getPixels(options)` - Read Layer Pixels

```javascript
const pixelObj = await imaging.getPixels({
    documentID: 123,           // Optional, defaults to active doc
    layerID: 5,                // Optional, reads composite if omitted
    colorSpace: "RGB",         // Optional, defaults to doc color space
    colorProfile: "sRGB IEC61966-2.1", // Optional
    componentSize: 8,          // 8, 16, 32, or -1 (use doc size)
    sourceBounds: {            // Optional, entire layer if omitted
        left: 0, top: 0, 
        right: 300, bottom: 300
        // OR use: width: 300, height: 300
    },
    targetSize: {              // Optional, for scaling
        width: 100,            // Specify one dimension for proportional scaling
        height: 100
    },
    applyAlpha: true           // Optional, convert RGBA to RGB with white matte
});

// Returns object with:
// {
//   imageData: PhotoshopImageData,
//   sourceBounds: { left, top, right, bottom },
//   level: 0  // Pyramid level used (0 = full resolution)
// }

// Access pixel data:
const pixelArray = await pixelObj.imageData.getData();
// Returns Uint8Array | Uint16Array | FloatArray

// Clean up after use:
pixelObj.imageData.dispose();
```

**Performance Notes:**
- All methods are async
- Use smallest possible targetSize for better performance
- Photoshop may use cached pyramid levels for scaled requests
- Always dispose of image data when done

---

### 2. `putPixels(options)` - Write Layer Pixels

```javascript
await imaging.putPixels({
    documentID: 123,           // Optional, defaults to active doc
    layerID: 5,                // Required, must be a pixel layer
    imageData: imageData,      // Required, PhotoshopImageData instance
    replace: true,             // Optional, default: true
                              // true = discard existing pixels first
                              // false = composite with existing
    targetBounds: {            // Optional, origin (0,0) if omitted
        left: 100, top: 50     // Only left, top are used
    },
    commandName: "My Filter"   // Optional, appears in History panel
});
```

---

### 3. `createImageDataFromBuffer(buffer, options)` - Create Image Data

```javascript
// Create from typed array
const width = 300;
const height = 300;
const components = 4; // RGBA
const dataSize = width * height * components;
const pixelArray = new Uint8Array(dataSize);

// Fill with data...
for (let i = 0; i < dataSize; i += components) {
    pixelArray[i] = 255;     // R
    pixelArray[i+1] = 0;     // G
    pixelArray[i+2] = 0;     // B
    pixelArray[i+3] = 127;   // A
}

// Create image data object
const imageData = await imaging.createImageDataFromBuffer(pixelArray, {
    width: width,
    height: height,
    components: 4,
    colorSpace: "RGB",
    colorProfile: "sRGB IEC61966-2.1",
    chunky: true           // Optional, default: true
});

// For layer masks (grayscale):
const maskData = await imaging.createImageDataFromBuffer(maskArray, {
    width: width,
    height: height,
    components: 1,         // Single channel for masks
    colorSpace: "Grayscale",
    colorProfile: "Gray Gamma 2.2",
    chunky: false          // Planar format for masks
});
```

---

### 4. `executeAsModal(targetFunction, options)` - Modal Execution

```javascript
try {
    await core.executeAsModal(async (executionContext) => {
        // All document modifications must happen here
        // Photoshop enters exclusive modal state
        
        // Check for user cancellation:
        if (executionContext.isCancelled) {
            throw "User cancelled";
        }
        
        // Report progress:
        executionContext.reportProgress({
            value: 0.5,           // 0-1, indeterminate if omitted
            commandName: "Processing..."
        });
        
        // Suspend history (group multiple changes):
        let suspensionID = await executionContext.hostControl.suspendHistory({
            documentID: doc.id,
            name: "My Command"
        });
        
        // Do work...
        
        // Resume history:
        await executionContext.hostControl.resumeHistory(suspensionID, true);
        
    }, {
        commandName: "Apply Dithering",
        timeOut: 30000,        // Optional, default: 1000ms
        interactive: false     // Optional, allow user input if true
    });
} catch (e) {
    if (e.number == 9) {
        console.error("Another plugin is modal");
    } else {
        console.error(e);
    }
}
```

**Important Rules:**
- Only one plugin can be modal at a time
- Escape key or "Cancel Plugin Command" menu cancels operation
- Cannot make doc changes outside executeAsModal
- Always await executeAsModal calls
- Use suspendHistory to group related changes into single history state

---

## Complete Example: Reading and Writing Pixels

```javascript
async function ditherImage(settings) {
    const { app, core, imaging } = require("photoshop");
    
    try {
        // Get source pixels
        const source = await imaging.getPixels({
            colorSpace: "RGB",
            componentSize: 8
        });
        
        const pixelData = await source.imageData.getData();
        const bounds = source.sourceBounds;
        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        
        // Process pixels
        const processed = processPixels(pixelData, width, height, settings);
        
        // Create output image data
        const output = await imaging.createImageDataFromBuffer(processed, {
            width: width,
            height: height,
            components: 4,
            colorSpace: "RGB",
            colorProfile: "sRGB IEC61966-2.1"
        });
        
        // Apply to layer
        await core.executeAsModal(async () => {
            await imaging.putPixels({
                layerID: app.activeDocument.activeLayers[0].id,
                imageData: output,
                replace: true,
                commandName: "Apply Dithering"
            });
        }, { commandName: "Apply Dithering" });
        
        // Cleanup
        source.imageData.dispose();
        output.dispose();
        
        return true;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}
```

---

## Common Patterns

### Pattern: Get Layer Dimensions
```javascript
const bounds = layer.boundsNoEffects;
const width = bounds.right - bounds.left;
const height = bounds.bottom - bounds.top;
```

### Pattern: Convert to Grayscale
```javascript
for (let i = 0; i < pixels.length; i += 4) {
    const gray = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    pixels[i] = gray;
    pixels[i+1] = gray;
    pixels[i+2] = gray;
    // pixels[i+3] = alpha, unchanged
}
```

### Pattern: Apply Brightness
```javascript
function applyBrightness(pixels, brightness) {
    const adjustment = brightness * 2.55; // -100..100 → -255..255
    for (let i = 0; i < pixels.length; i += 4) {
        for (let c = 0; c < 3; c++) { // RGB only
            pixels[i + c] = Math.max(0, Math.min(255, pixels[i + c] + adjustment));
        }
    }
}
```

### Pattern: Apply Contrast
```javascript
function applyContrast(pixels, contrast) {
    const factor = (100 + contrast) / 100;
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < pixels.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            pixels[i + c] = Math.max(0, Math.min(255, pixels[i + c] * factor + intercept));
        }
    }
}
```

---

## Memory Management

### Best Practices
1. Always call `dispose()` on PhotoshopImageData after use
2. Use smallest possible image dimensions in getPixels
3. Process images in chunks for very large files
4. Don't hold onto multiple large image buffers simultaneously
5. Use pyramid levels (targetSize) for thumbnails

### Memory Limits
- Typical limit: ~600MB for plugin memory
- Large image processing will trigger warnings
- Use Web Workers for heavy computation to avoid blocking UI

---

## Error Handling

```javascript
try {
    await core.executeAsModal(async (ctx) => {
        if (ctx.isCancelled) throw "User cancelled";
        // ... do work
    });
} catch (error) {
    if (error.number == 9) {
        // Modal state error (another plugin active)
        showAlert("Another plugin is currently processing");
    } else if (error === "User cancelled") {
        showAlert("Operation cancelled");
    } else {
        showAlert(`Error: ${error.message}`);
    }
}
```

---

## Related Resources

- [Official Photoshop API Reference](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/)
- [Imaging API Documentation](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/imaging/)
- [executeAsModal Documentation](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/executeasmodal/)
- [Sample Code](https://github.com/AdobeDocs/uxp-photoshop-plugin-samples)
