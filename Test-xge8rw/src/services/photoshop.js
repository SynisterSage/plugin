const photoshop = require("photoshop");
const { app, core, action, imaging } = photoshop;

/**
 * Get the active document
 */
export function getActiveDocument() {
    try {
        if (!app.activeDocument) {
            return null;
        }
        return app.activeDocument;
    } catch (error) {
        console.error("Error getting active document:", error);
        return null;
    }
}

/**
 * Get the active layer
 */
export function getActiveLayer() {
    try {
        const doc = getActiveDocument();
        if (!doc || !doc.activeLayers || doc.activeLayers.length === 0) {
            console.warn("No active layers found");
            return null;
        }
        
        const layer = doc.activeLayers[0];
        console.log(`Active layer: ${layer.name}, Kind: ${layer.kind}`);
        
        // Check if it's a pixel layer (not a group)
        if (layer.kind !== "group") {
            return layer;
        } else {
            console.warn("Active layer is a group, cannot work with groups");
            return null;
        }
    } catch (error) {
        console.error("Error getting active layer:", error);
        return null;
    }
}

/**
 * Get pixel data from the active layer using the Imaging API
 */
export async function getLayerPixelData() {
    try {
        const doc = getActiveDocument();
        const layer = getActiveLayer();
        
        if (!doc || !layer) {
            return null;
        }
        
        // Use the official Imaging API to get pixel data from the active layer
        const pixelObj = await imaging.getPixels({
            layerID: layer.id,
            colorSpace: "RGB",
            componentSize: 8  // 8-bit per component (0-255)
        });
        
        // Get the actual pixel data as Uint8Array
        const pixelData = await pixelObj.imageData.getData();
        
        return {
            layerName: layer.name,
            layerID: layer.id,
            imageData: pixelObj.imageData,
            pixelData: pixelData,
            bounds: pixelObj.sourceBounds,
            width: pixelObj.sourceBounds.right - pixelObj.sourceBounds.left,
            height: pixelObj.sourceBounds.bottom - pixelObj.sourceBounds.top
        };
        
    } catch (error) {
        console.error("Error getting layer pixel data:", error);
        return null;
    }
}

/**
 * Render dithered result to a new layer above the active layer
 * Creates a transparent overlay with ONLY the dithered effect
 * Allows user to adjust opacity and blend modes
 */
export async function renderDitheredResult(settings) {
    try {
        console.log("=== Starting renderDitheredResult ===");
        const doc = getActiveDocument();
        let layer = getActiveLayer();
        
        console.log("Document:", doc ? `${doc.name}` : "null");
        console.log("Layer:", layer ? `${layer.name} (ID: ${layer.id}, Kind: ${layer.kind})` : "null");
        
        if (!doc || !layer) {
            console.error("No active document or layer");
            throw new Error("No active document or layer found");
        }

        // If it's a smart object, we need to rasterize it first
        if (layer.kind === "smartObject") {
            console.log("Smart object detected, rasterizing...");
            await core.executeAsModal(async () => {
                await layer.rasterize();
            }, { commandName: "Rasterize Smart Object" });
            console.log("Smart object rasterized");
        }

        // All Imaging API calls must be inside executeAsModal
        await core.executeAsModal(async (executionContext) => {
            console.log("Inside executeAsModal scope");
            
            console.log("Getting pixel data from source layer...");
            
            // Calculate target size based on DPI
            // Standard: 72 DPI = 100% (no scaling)
            // 144 DPI = 200% (2x larger dithering pattern)
            // 36 DPI = 50% (smaller, tighter pattern)
            const dpiScale = settings.inputDPI / 72;
            
            // Get the document/layer bounds first to calculate scaled target size
            const tempPixelObj = await imaging.getPixels({
                layerID: layer.id,
                colorSpace: "RGB",
                componentSize: 8
            });
            
            const tempBounds = tempPixelObj.sourceBounds;
            const tempWidth = tempBounds.right - tempBounds.left;
            const tempHeight = tempBounds.bottom - tempBounds.top;
            
            // Calculate scaled dimensions based on DPI
            const scaledWidth = Math.ceil(tempWidth * dpiScale);
            const scaledHeight = Math.ceil(tempHeight * dpiScale);
            
            console.log(`DPI Scale: ${dpiScale}x (${settings.inputDPI} DPI -> ${scaledWidth}x${scaledHeight})`);
            
            // Dispose the temporary object
            tempPixelObj.imageData.dispose();
            
            // Now get the actual pixel data with DPI scaling applied
            const pixelObj = await imaging.getPixels({
                layerID: layer.id,
                colorSpace: "RGB",
                componentSize: 8,  // 8-bit per component (0-255)
                targetSize: {
                    width: scaledWidth,
                    height: scaledHeight
                }
            });

            if (!pixelObj || !pixelObj.imageData) {
                console.error("Failed to get pixel data");
                throw new Error("Failed to get pixel data from layer");
            }

            const sourceImageData = pixelObj.imageData;
            const bounds = pixelObj.sourceBounds;
            const width = bounds.right - bounds.left;
            const height = bounds.bottom - bounds.top;

            console.log(`Image bounds: ${width}x${height}`);
            
            // Get the pixel data as Uint8Array
            const pixels = await sourceImageData.getData();
            console.log(`Got pixel data: ${pixels.length} bytes`);

            // Process the pixels (apply all effects and dithering)
            console.log("Processing pixels...");
            const processedPixels = processImagePixels(pixels, width, height, settings);
            console.log(`Processed pixels: ${processedPixels.length} bytes`);

            // Detect document's color profile for accurate color handling
            let documentColorProfile = "sRGB IEC61966-2.1";  // Default fallback
            try {
                // Try to get the document's color profile
                if (doc.colorSettings && doc.colorSettings.colorProfile) {
                    documentColorProfile = doc.colorSettings.colorProfile;
                    console.log(`Using document color profile: ${documentColorProfile}`);
                } else {
                    // Fallback: get available RGB profiles and use the first (usually working profile)
                    const rgbProfiles = await require("photoshop").app.getColorProfiles("RGB");
                    if (rgbProfiles && rgbProfiles.length > 0) {
                        documentColorProfile = rgbProfiles[0];
                        console.log(`Using available RGB profile: ${documentColorProfile}`);
                    }
                }
            } catch (profileError) {
                console.warn("Could not detect color profile, using sRGB default:", profileError);
            }

            // Create new image data with processed pixels
            console.log("Creating image data buffer...");
            const processedImageData = await imaging.createImageDataFromBuffer(
                processedPixels,
                {
                    width: width,
                    height: height,
                    components: 4,  // RGBA
                    colorSpace: "RGB",
                    colorProfile: documentColorProfile
                }
            );
            console.log("Image data created successfully");

            // Create a new TRANSPARENT layer above the current layer for the overlay effect
            console.log("Creating new dither overlay layer...");
            const newLayer = await doc.createLayer({
                name: `Dither (${settings.algorithm})`,
                opacity: 100,
                blendMode: "normal",
                fill: "transparent"  // Start with transparent layer
            });
            console.log(`New layer created: ${newLayer.name} (ID: ${newLayer.id})`);

            // Apply dithered pixels to the new layer at the correct position
            console.log("Applying dithered effect to overlay layer...");
            await imaging.putPixels({
                layerID: newLayer.id,
                imageData: processedImageData,
                targetBounds: {
                    left: bounds.left,
                    top: bounds.top
                },
                replace: true,
                commandName: `Apply ${settings.algorithm} Dithering Overlay`
            });
            console.log("putPixels completed");

            // Clean up
            sourceImageData.dispose();
            processedImageData.dispose();
            
        }, { commandName: "Apply Dithering Overlay" });

        console.log("=== renderDitheredResult completed successfully ===");
        return true;
        
    } catch (error) {
        console.error("=== Error rendering dithered result ===");
        console.error("Error message:", error.message);
        console.error("Error code:", error.number);
        console.error("Full error:", error);
        return false;
    }
}

/**
 * Process image pixels with all settings applied
 * Creates a dithering overlay effect by comparing original vs dithered
 */
function processImagePixels(pixels, width, height, settings) {
    // Keep original for comparison
    const original = new Uint8Array(pixels);
    
    // Create a copy of the pixels to work with
    const processed = new Uint8Array(pixels);

    // Apply brightness adjustment
    if (settings.brightness !== 0) {
        applyBrightness(processed, settings.brightness);
    }

    // Apply contrast adjustment
    if (settings.contrast !== 0) {
        applyContrast(processed, settings.contrast);
    }

    // Apply blur if needed
    if (settings.blur > 0) {
        applyBlur(processed, width, height, Math.round(settings.blur));
    }

    // Apply noise if needed
    if (settings.noise > 0) {
        applyNoise(processed, settings.noise);
    }

    // Apply denoise if needed
    if (settings.denoise > 0) {
        applyDenoise(processed, width, height, Math.round(settings.denoise));
    }

    // Apply sharpen if needed
    if (settings.sharpenStrength > 0) {
        applySharpen(processed, width, height, settings.sharpenStrength, Math.round(settings.sharpenRadius));
    }

    // Handle dot size scaling for halftone effect
    let ditherWidth = width;
    let ditherHeight = height;
    let scaledPixels = processed;
    
    if (settings.dotSize && settings.dotSize > 1) {
        // Scale down image for larger dots
        const scaleFactor = 1 / settings.dotSize;
        ditherWidth = Math.max(1, Math.floor(width * scaleFactor));
        ditherHeight = Math.max(1, Math.floor(height * scaleFactor));
        scaledPixels = scalePixelsDown(processed, width, height, ditherWidth, ditherHeight);
    }

    // Apply dithering algorithm based on selection
    console.log(`Applying ${settings.algorithm} dithering with colorDepth: ${settings.colorDepth}, intensity: ${settings.ditherIntensity}%, dotSize: ${settings.dotSize || 1}x`);
    
    if (settings.algorithm === "floyd-steinberg") {
        applyFloydSteinbergDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "jarvis-judice-ninke") {
        applyJarvisJudiceNinkeDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "stucki") {
        applyStuckiDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "sierra") {
        applySierraDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "burkes") {
        applyBurkesDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "atkinson") {
        applyAtkinsonDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, settings.ditherIntensity);
    } else if (settings.algorithm === "ordered-2x2") {
        applyOrderedDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, 2, settings.ditherIntensity);
    } else if (settings.algorithm === "ordered-4x4") {
        applyOrderedDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, 4, settings.ditherIntensity);
    } else if (settings.algorithm === "ordered-8x8") {
        applyOrderedDithering(scaledPixels, ditherWidth, ditherHeight, settings.colorDepth, 8, settings.ditherIntensity);
    } else if (settings.algorithm === "threshold") {
        applyThreshold(scaledPixels, 128);
    }

    // Scale back up if we scaled down
    if (settings.dotSize && settings.dotSize > 1) {
        const scaled = scalePixelsUp(scaledPixels, ditherWidth, ditherHeight, width, height);
        // Copy scaled result back to processed
        processed.set(scaled);
    } else {
        // Copy scaled result back to processed (no scaling needed)
        processed.set(scaledPixels);
    }

    // Apply color mapping if enabled
    // This transforms the dithered pattern into the user's selected color scheme
    if (settings.tonalMappingType && settings.tonalMappingType !== "none") {
        console.log(`Applying color mapping: ${settings.tonalMappingType}`);
        applyColorMapping(processed, width, height, settings.tonalMappingType, {
            shadowColor: settings.shadowColor || "#000000",
            midtoneColor: settings.midtoneColor || "#808080",
            highlightColor: settings.highlightColor || "#ffffff"
        });
    }

    // Create overlay effect: blend dithered result with transparency
    // This makes it look like an overlay rather than a full replacement
    createDitheringOverlay(original, processed, width, height, settings.ditherIntensity);

    return processed;
}

/**
 * Create a dithering overlay effect by making the output semi-transparent
 * and only showing where the dithering differs from the original
 * Intensity controls how strong the effect is (0-200%, 100% = normal)
 */
function createDitheringOverlay(original, dithered, width, height, intensity = 100) {
    // Normalize intensity to 0-2 range (0-200%)
    const intensityFactor = intensity / 100;
    
    // For each pixel, calculate the difference between original and dithered
    // Use that to set the alpha channel for the overlay effect
    
    for (let i = 0; i < original.length; i += 4) {
        const origR = original[i];
        const origG = original[i + 1];
        const origB = original[i + 2];
        
        const dithR = dithered[i];
        const dithG = dithered[i + 1];
        const dithB = dithered[i + 2];
        
        // Calculate the difference (how much the dithering changed this pixel)
        const diffR = Math.abs(dithR - origR);
        const diffG = Math.abs(dithG - origG);
        const diffB = Math.abs(dithB - origB);
        
        // Use the average difference as alpha for the overlay
        // This creates a natural blend where heavy dithering = more opaque
        const avgDiff = (diffR + diffG + diffB) / 3;
        
        // Set alpha to the difference amount scaled by intensity (0-255)
        // This allows users to adjust opacity in Photoshop to fine-tune the effect
        dithered[i + 3] = Math.round(Math.min(255, avgDiff * intensityFactor));
    }
}

/**
 * Apply Floyd-Steinberg dithering - converts to indexed color
 * intensity controls how aggressively error is distributed (100% = normal)
 */
function applyFloydSteinbergDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100; // 0-2 range
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error to neighboring pixels
            if (x + 1 < width) {
                errR[y * width + x + 1] += er * 7 / 16;
                errG[y * width + x + 1] += eg * 7 / 16;
                errB[y * width + x + 1] += eb * 7 / 16;
            }
            if (y + 1 < height) {
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er * 3 / 16;
                    errG[(y + 1) * width + x - 1] += eg * 3 / 16;
                    errB[(y + 1) * width + x - 1] += eb * 3 / 16;
                }
                errR[(y + 1) * width + x] += er * 5 / 16;
                errG[(y + 1) * width + x] += eg * 5 / 16;
                errB[(y + 1) * width + x] += eb * 5 / 16;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er * 1 / 16;
                    errG[(y + 1) * width + x + 1] += eg * 1 / 16;
                    errB[(y + 1) * width + x + 1] += eb * 1 / 16;
                }
            }
        }
    }
}

/**
 * Apply brightness adjustment to pixel data
 */
function applyBrightness(pixels, brightness) {
    const adjustment = brightness * 2.55; // Convert -100..100 to -255..255
    
    for (let i = 0; i < pixels.length; i += 4) {
        // Apply to R, G, B channels only (skip alpha at i+3)
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + adjustment));
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + adjustment));
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + adjustment));
    }
}

/**
 * Apply contrast adjustment to pixel data
 */
function applyContrast(pixels, contrast) {
    const factor = (100 + contrast) / 100;
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.max(0, Math.min(255, pixels[i] * factor + intercept));
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] * factor + intercept));
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] * factor + intercept));
    }
}

/**
 * Apply ordered dithering (Bayer pattern) with configurable matrix size
 */
function applyOrderedDithering(pixels, width, height, colorDepth, matrixSize = 4, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    
    let bayerMatrix;
    
    // Select Bayer matrix based on size
    if (matrixSize === 2) {
        bayerMatrix = [
            [0, 2],
            [3, 1]
        ];
    } else if (matrixSize === 4) {
        bayerMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
    } else if (matrixSize === 8) {
        // 8x8 Bayer matrix (higher quality, more granular)
        bayerMatrix = [
            [0, 32, 8, 40, 2, 34, 10, 42],
            [48, 16, 56, 24, 50, 18, 58, 26],
            [12, 44, 4, 36, 14, 46, 6, 38],
            [60, 28, 52, 20, 62, 30, 54, 22],
            [3, 35, 11, 43, 1, 33, 9, 41],
            [51, 19, 59, 27, 49, 17, 57, 25],
            [15, 47, 7, 39, 13, 45, 5, 37],
            [63, 31, 55, 23, 61, 29, 53, 21]
        ];
    } else {
        bayerMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
    }
    
    // Normalize to 0-255 range based on matrix size
    const maxValue = matrixSize * matrixSize;
    const normalizedBayer = bayerMatrix.map(row => 
        row.map(val => (val / maxValue) * 255)
    );

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const bayerValue = normalizedBayer[y % matrixSize][x % matrixSize];
            
            // Quantize levels
            const stepSize = 256 / levels;
            
            // Apply ordered dithering to each RGB channel
            for (let c = 0; c < 3; c++) {
                const value = pixels[index + c];
                
                // Add dither threshold, scaled by intensity
                const dithered = value + ((bayerValue - 128) * intensityFactor);
                
                // Quantize to nearest level
                const quantized = Math.round(dithered / stepSize) * stepSize;
                pixels[index + c] = Math.max(0, Math.min(255, quantized));
            }
        }
    }
}

/**
 * Apply Jarvis-Judice-Ninke dithering - better quality than Floyd-Steinberg but slower
 */
function applyJarvisJudiceNinkeDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error using Jarvis-Judice-Ninke pattern
            // Current row:  1/48 * [X, 7, 5]
            // Next row:     1/48 * [3, 5, 7, 5, 3]
            // Next+1 row:   1/48 * [1, 3, 5, 3, 1]
            
            if (x + 1 < width) {
                errR[y * width + x + 1] += er * 7 / 48;
                errG[y * width + x + 1] += eg * 7 / 48;
                errB[y * width + x + 1] += eb * 7 / 48;
            }
            if (x + 2 < width) {
                errR[y * width + x + 2] += er * 5 / 48;
                errG[y * width + x + 2] += eg * 5 / 48;
                errB[y * width + x + 2] += eb * 5 / 48;
            }
            
            if (y + 1 < height) {
                if (x > 1) {
                    errR[(y + 1) * width + x - 2] += er * 3 / 48;
                    errG[(y + 1) * width + x - 2] += eg * 3 / 48;
                    errB[(y + 1) * width + x - 2] += eb * 3 / 48;
                }
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er * 5 / 48;
                    errG[(y + 1) * width + x - 1] += eg * 5 / 48;
                    errB[(y + 1) * width + x - 1] += eb * 5 / 48;
                }
                errR[(y + 1) * width + x] += er * 7 / 48;
                errG[(y + 1) * width + x] += eg * 7 / 48;
                errB[(y + 1) * width + x] += eb * 7 / 48;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er * 5 / 48;
                    errG[(y + 1) * width + x + 1] += eg * 5 / 48;
                    errB[(y + 1) * width + x + 1] += eb * 5 / 48;
                }
                if (x + 2 < width) {
                    errR[(y + 1) * width + x + 2] += er * 3 / 48;
                    errG[(y + 1) * width + x + 2] += eg * 3 / 48;
                    errB[(y + 1) * width + x + 2] += eb * 3 / 48;
                }
            }
            
            if (y + 2 < height) {
                if (x > 1) {
                    errR[(y + 2) * width + x - 2] += er * 1 / 48;
                    errG[(y + 2) * width + x - 2] += eg * 1 / 48;
                    errB[(y + 2) * width + x - 2] += eb * 1 / 48;
                }
                if (x > 0) {
                    errR[(y + 2) * width + x - 1] += er * 3 / 48;
                    errG[(y + 2) * width + x - 1] += eg * 3 / 48;
                    errB[(y + 2) * width + x - 1] += eb * 3 / 48;
                }
                errR[(y + 2) * width + x] += er * 5 / 48;
                errG[(y + 2) * width + x] += eg * 5 / 48;
                errB[(y + 2) * width + x] += eb * 5 / 48;
                if (x + 1 < width) {
                    errR[(y + 2) * width + x + 1] += er * 3 / 48;
                    errG[(y + 2) * width + x + 1] += eg * 3 / 48;
                    errB[(y + 2) * width + x + 1] += eb * 3 / 48;
                }
                if (x + 2 < width) {
                    errR[(y + 2) * width + x + 2] += er * 1 / 48;
                    errG[(y + 2) * width + x + 2] += eg * 1 / 48;
                    errB[(y + 2) * width + x + 2] += eb * 1 / 48;
                }
            }
        }
    }
}

/**
 * Apply Atkinson dithering - fast and visually distinct
 */
function applyAtkinsonDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error using Atkinson pattern (1/8 distribution)
            // Current row: X, 1, 1
            // Next row:    1, 1, 1
            // Next+1 row:     1
            
            if (x + 1 < width) {
                errR[y * width + x + 1] += er / 8;
                errG[y * width + x + 1] += eg / 8;
                errB[y * width + x + 1] += eb / 8;
            }
            if (x + 2 < width) {
                errR[y * width + x + 2] += er / 8;
                errG[y * width + x + 2] += eg / 8;
                errB[y * width + x + 2] += eb / 8;
            }
            
            if (y + 1 < height) {
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er / 8;
                    errG[(y + 1) * width + x - 1] += eg / 8;
                    errB[(y + 1) * width + x - 1] += eb / 8;
                }
                errR[(y + 1) * width + x] += er / 8;
                errG[(y + 1) * width + x] += eg / 8;
                errB[(y + 1) * width + x] += eb / 8;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er / 8;
                    errG[(y + 1) * width + x + 1] += eg / 8;
                    errB[(y + 1) * width + x + 1] += eb / 8;
                }
            }
            
            if (y + 2 < height && x > 0) {
                errR[(y + 2) * width + x - 1] += er / 8;
                errG[(y + 2) * width + x - 1] += eg / 8;
                errB[(y + 2) * width + x - 1] += eb / 8;
            }
        }
    }
}

/**
 * Apply Sierra dithering - balanced quality and speed
 */
function applySierraDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error using Sierra pattern
            // Current row:  X, 4, 3
            // Next row:  1, 2, 3, 2, 1 (divided by 16)
            
            if (x + 1 < width) {
                errR[y * width + x + 1] += er * 4 / 16;
                errG[y * width + x + 1] += eg * 4 / 16;
                errB[y * width + x + 1] += eb * 4 / 16;
            }
            if (x + 2 < width) {
                errR[y * width + x + 2] += er * 3 / 16;
                errG[y * width + x + 2] += eg * 3 / 16;
                errB[y * width + x + 2] += eb * 3 / 16;
            }
            
            if (y + 1 < height) {
                if (x > 1) {
                    errR[(y + 1) * width + x - 2] += er * 1 / 16;
                    errG[(y + 1) * width + x - 2] += eg * 1 / 16;
                    errB[(y + 1) * width + x - 2] += eb * 1 / 16;
                }
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er * 2 / 16;
                    errG[(y + 1) * width + x - 1] += eg * 2 / 16;
                    errB[(y + 1) * width + x - 1] += eb * 2 / 16;
                }
                errR[(y + 1) * width + x] += er * 3 / 16;
                errG[(y + 1) * width + x] += eg * 3 / 16;
                errB[(y + 1) * width + x] += eb * 3 / 16;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er * 2 / 16;
                    errG[(y + 1) * width + x + 1] += eg * 2 / 16;
                    errB[(y + 1) * width + x + 1] += eb * 2 / 16;
                }
                if (x + 2 < width) {
                    errR[(y + 1) * width + x + 2] += er * 1 / 16;
                    errG[(y + 1) * width + x + 2] += eg * 1 / 16;
                    errB[(y + 1) * width + x + 2] += eb * 1 / 16;
                }
            }
        }
    }
}

/**
 * Apply Burkes dithering - fast high-quality variant
 */
function applyBurkesDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error using Burkes pattern (simplified Stucki)
            // Current row:  X, 8, 4
            // Next row:  2, 4, 8, 4, 2 (divided by 32)
            
            if (x + 1 < width) {
                errR[y * width + x + 1] += er * 8 / 32;
                errG[y * width + x + 1] += eg * 8 / 32;
                errB[y * width + x + 1] += eb * 8 / 32;
            }
            if (x + 2 < width) {
                errR[y * width + x + 2] += er * 4 / 32;
                errG[y * width + x + 2] += eg * 4 / 32;
                errB[y * width + x + 2] += eb * 4 / 32;
            }
            
            if (y + 1 < height) {
                if (x > 1) {
                    errR[(y + 1) * width + x - 2] += er * 2 / 32;
                    errG[(y + 1) * width + x - 2] += eg * 2 / 32;
                    errB[(y + 1) * width + x - 2] += eb * 2 / 32;
                }
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er * 4 / 32;
                    errG[(y + 1) * width + x - 1] += eg * 4 / 32;
                    errB[(y + 1) * width + x - 1] += eb * 4 / 32;
                }
                errR[(y + 1) * width + x] += er * 8 / 32;
                errG[(y + 1) * width + x] += eg * 8 / 32;
                errB[(y + 1) * width + x] += eb * 8 / 32;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er * 4 / 32;
                    errG[(y + 1) * width + x + 1] += eg * 4 / 32;
                    errB[(y + 1) * width + x + 1] += eb * 4 / 32;
                }
                if (x + 2 < width) {
                    errR[(y + 1) * width + x + 2] += er * 2 / 32;
                    errG[(y + 1) * width + x + 2] += eg * 2 / 32;
                    errB[(y + 1) * width + x + 2] += eb * 2 / 32;
                }
            }
        }
    }
}

/**
 * Apply Stucki dithering - highest quality but slowest
 */
function applyStuckiDithering(pixels, width, height, colorDepth, intensity = 100) {
    const levels = colorDepth;
    const intensityFactor = intensity / 100;
    const errR = new Float32Array(pixels.length / 4);
    const errG = new Float32Array(pixels.length / 4);
    const errB = new Float32Array(pixels.length / 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Current pixel + error
            let r = Math.min(255, Math.max(0, pixels[idx] + errR[y * width + x]));
            let g = Math.min(255, Math.max(0, pixels[idx + 1] + errG[y * width + x]));
            let b = Math.min(255, Math.max(0, pixels[idx + 2] + errB[y * width + x]));

            // Quantize to nearest color level
            const qr = Math.round((r / 255) * (levels - 1)) / (levels - 1) * 255;
            const qg = Math.round((g / 255) * (levels - 1)) / (levels - 1) * 255;
            const qb = Math.round((b / 255) * (levels - 1)) / (levels - 1) * 255;

            // Calculate error
            const er = (r - qr) * intensityFactor;
            const eg = (g - qg) * intensityFactor;
            const eb = (b - qb) * intensityFactor;

            // Set quantized pixel
            pixels[idx] = qr;
            pixels[idx + 1] = qg;
            pixels[idx + 2] = qb;

            // Distribute error using Stucki pattern (full matrix)
            // Current row:      X, 8, 4
            // Next row:     2, 4, 8, 4, 2
            // Next+1 row:   1, 2, 4, 2, 1 (divided by 42)
            
            if (x + 1 < width) {
                errR[y * width + x + 1] += er * 8 / 42;
                errG[y * width + x + 1] += eg * 8 / 42;
                errB[y * width + x + 1] += eb * 8 / 42;
            }
            if (x + 2 < width) {
                errR[y * width + x + 2] += er * 4 / 42;
                errG[y * width + x + 2] += eg * 4 / 42;
                errB[y * width + x + 2] += eb * 4 / 42;
            }
            
            if (y + 1 < height) {
                if (x > 1) {
                    errR[(y + 1) * width + x - 2] += er * 2 / 42;
                    errG[(y + 1) * width + x - 2] += eg * 2 / 42;
                    errB[(y + 1) * width + x - 2] += eb * 2 / 42;
                }
                if (x > 0) {
                    errR[(y + 1) * width + x - 1] += er * 4 / 42;
                    errG[(y + 1) * width + x - 1] += eg * 4 / 42;
                    errB[(y + 1) * width + x - 1] += eb * 4 / 42;
                }
                errR[(y + 1) * width + x] += er * 8 / 42;
                errG[(y + 1) * width + x] += eg * 8 / 42;
                errB[(y + 1) * width + x] += eb * 8 / 42;
                if (x + 1 < width) {
                    errR[(y + 1) * width + x + 1] += er * 4 / 42;
                    errG[(y + 1) * width + x + 1] += eg * 4 / 42;
                    errB[(y + 1) * width + x + 1] += eb * 4 / 42;
                }
                if (x + 2 < width) {
                    errR[(y + 1) * width + x + 2] += er * 2 / 42;
                    errG[(y + 1) * width + x + 2] += eg * 2 / 42;
                    errB[(y + 1) * width + x + 2] += eb * 2 / 42;
                }
            }
            
            if (y + 2 < height) {
                if (x > 1) {
                    errR[(y + 2) * width + x - 2] += er * 1 / 42;
                    errG[(y + 2) * width + x - 2] += eg * 1 / 42;
                    errB[(y + 2) * width + x - 2] += eb * 1 / 42;
                }
                if (x > 0) {
                    errR[(y + 2) * width + x - 1] += er * 2 / 42;
                    errG[(y + 2) * width + x - 1] += eg * 2 / 42;
                    errB[(y + 2) * width + x - 1] += eb * 2 / 42;
                }
                errR[(y + 2) * width + x] += er * 4 / 42;
                errG[(y + 2) * width + x] += eg * 4 / 42;
                errB[(y + 2) * width + x] += eb * 4 / 42;
                if (x + 1 < width) {
                    errR[(y + 2) * width + x + 1] += er * 2 / 42;
                    errG[(y + 2) * width + x + 1] += eg * 2 / 42;
                    errB[(y + 2) * width + x + 1] += eb * 2 / 42;
                }
                if (x + 2 < width) {
                    errR[(y + 2) * width + x + 2] += er * 1 / 42;
                    errG[(y + 2) * width + x + 2] += eg * 1 / 42;
                    errB[(y + 2) * width + x + 2] += eb * 1 / 42;
                }
            }
        }
    }
}

/**
 * Apply simple threshold dithering
 */
function applyThreshold(pixels, threshold) {
    for (let i = 0; i < pixels.length; i += 4) {
        // Convert to grayscale for threshold calculation
        const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        const bw = gray > threshold ? 255 : 0;
        
        // Apply to all channels
        pixels[i] = bw;
        pixels[i + 1] = bw;
        pixels[i + 2] = bw;
    }
}

/**
 * Create a new layer
 */
export async function createDitheredLayer(name = "Dithered") {
    try {
        const doc = getActiveDocument();
        
        if (!doc) {
            return false;
        }
        
        await core.executeAsModal(async () => {
            await doc.createLayer({
                name: name,
                opacity: 100,
                blendMode: "normal"
            });
        }, { commandName: "Create Layer" });
        
        return true;
    } catch (error) {
        console.error("Error creating dithered layer:", error);
        return false;
    }
}

/**
 * Apply simple fast blur - uses separable convolution for performance
 * Much faster than 2D box blur on large images
 */
function applyBlur(pixels, width, height, radius) {
    if (radius <= 0) return;
    
    // Cap radius at 3 for performance on large images
    radius = Math.min(radius, 3);
    
    // Use a simple weighted average with closer neighbors
    // This is much faster than full 2D convolution
    const temp = new Uint8Array(pixels);
    
    for (let i = 0; i < pixels.length; i += 4) {
        const pixelIndex = Math.floor(i / 4);
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        let sumR = pixels[i] * 2; // Original pixel gets 2x weight
        let sumG = pixels[i + 1] * 2;
        let sumB = pixels[i + 2] * 2;
        let count = 2;
        
        // Just sample immediate neighbors (much faster)
        // Right
        if (x + 1 < width) {
            const idx = i + 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        // Left
        if (x > 0) {
            const idx = i - 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        // Down
        if (y + 1 < height) {
            const idx = i + width * 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        // Up
        if (y > 0) {
            const idx = i - width * 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        
        temp[i] = Math.round(sumR / count);
        temp[i + 1] = Math.round(sumG / count);
        temp[i + 2] = Math.round(sumB / count);
    }
    
    // Copy back - only if radius > 1, do it multiple times
    const passes = Math.min(radius, 2);
    for (let pass = 0; pass < passes; pass++) {
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = temp[i];
            pixels[i + 1] = temp[i + 1];
            pixels[i + 2] = temp[i + 2];
        }
    }
}

/**
 * Add random noise to pixels
 */
function applyNoise(pixels, intensity) {
    const amount = Math.min(255, intensity * 2.55); // Convert 0-100 to 0-255
    
    for (let i = 0; i < pixels.length; i += 4) {
        // Add random noise to RGB channels
        const noise = (Math.random() - 0.5) * amount * 2;
        
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise));
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + noise));
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + noise));
    }
}

/**
 * Apply simple median-like denoise using fast neighbor averaging
 */
function applyDenoise(pixels, width, height, radius) {
    if (radius <= 0) return;
    
    const denoised = new Uint8Array(pixels);
    const strength = Math.min(radius / 10, 1); // Normalize radius to 0-1
    
    // Simple denoise: blend with neighbor average
    for (let i = 0; i < pixels.length; i += 4) {
        const pixelIndex = Math.floor(i / 4);
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        
        // Only sample immediate neighbors for speed
        const neighbors = [
            i, // self
            x + 1 < width ? i + 4 : i, // right
            x > 0 ? i - 4 : i, // left
            y + 1 < height ? i + width * 4 : i, // down
            y > 0 ? i - width * 4 : i // up
        ];
        
        for (const idx of neighbors) {
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        
        // Blend original with averaged neighbors
        denoised[i] = Math.round(pixels[i] * (1 - strength) + (sumR / count) * strength);
        denoised[i + 1] = Math.round(pixels[i + 1] * (1 - strength) + (sumG / count) * strength);
        denoised[i + 2] = Math.round(pixels[i + 2] * (1 - strength) + (sumB / count) * strength);
    }
    
    // Copy denoised back to original
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = denoised[i];
        pixels[i + 1] = denoised[i + 1];
        pixels[i + 2] = denoised[i + 2];
    }
}

/**
 * Apply fast unsharp mask sharpening - enhances edges
 */
function applySharpen(pixels, width, height, strength, radius) {
    if (strength <= 0 || radius <= 0) return;
    
    const blurred = new Uint8Array(pixels);
    const factor = Math.min(strength / 100, 2); // Cap factor for stability
    
    // Create fast blurred version - simple neighbor average
    for (let i = 0; i < pixels.length; i += 4) {
        const pixelIndex = Math.floor(i / 4);
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        let sumR = pixels[i] * 2;
        let sumG = pixels[i + 1] * 2;
        let sumB = pixels[i + 2] * 2;
        let count = 2;
        
        // Only immediate neighbors
        if (x + 1 < width) {
            const idx = i + 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        if (x > 0) {
            const idx = i - 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        if (y + 1 < height) {
            const idx = i + width * 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        if (y > 0) {
            const idx = i - width * 4;
            sumR += pixels[idx];
            sumG += pixels[idx + 1];
            sumB += pixels[idx + 2];
            count++;
        }
        
        blurred[i] = Math.round(sumR / count);
        blurred[i + 1] = Math.round(sumG / count);
        blurred[i + 2] = Math.round(sumB / count);
    }
    
    // Apply unsharp mask: original + (original - blurred) * strength
    for (let i = 0; i < pixels.length; i += 4) {
        const diff = pixels[i] - blurred[i];
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + diff * factor));
        
        const diffG = pixels[i + 1] - blurred[i + 1];
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + diffG * factor));
        
        const diffB = pixels[i + 2] - blurred[i + 2];
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + diffB * factor));
    }
}

/**
 * Calculate perceptual luminance of a color using ITU-R BT.709 standard
 * This matches human perception better than simple RGB average
 * Returns 0-255 range representing brightness
 */
function getLuminance(r, g, b) {
    // ITU-R BT.709 weights: Red is weighted higher because human eyes are more sensitive
    return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

/**
 * Scale pixel data down using nearest neighbor (simple and fast)
 * Used for creating larger halftone dots
 */
function scalePixelsDown(pixels, srcWidth, srcHeight, dstWidth, dstHeight) {
    const scaled = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    const xRatio = srcWidth / dstWidth;
    const yRatio = srcHeight / dstHeight;
    
    for (let y = 0; y < dstHeight; y++) {
        for (let x = 0; x < dstWidth; x++) {
            const srcX = Math.floor(x * xRatio);
            const srcY = Math.floor(y * yRatio);
            const srcIdx = (srcY * srcWidth + srcX) * 4;
            const dstIdx = (y * dstWidth + x) * 4;
            
            // Copy RGBA
            scaled[dstIdx] = pixels[srcIdx];
            scaled[dstIdx + 1] = pixels[srcIdx + 1];
            scaled[dstIdx + 2] = pixels[srcIdx + 2];
            scaled[dstIdx + 3] = pixels[srcIdx + 3];
        }
    }
    
    return scaled;
}

/**
 * Scale pixel data up using nearest neighbor (creates blocky halftone effect)
 * Used after dithering to enlarge the pattern
 */
function scalePixelsUp(pixels, srcWidth, srcHeight, dstWidth, dstHeight) {
    const scaled = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    const xRatio = srcWidth / dstWidth;
    const yRatio = srcHeight / dstHeight;
    
    for (let y = 0; y < dstHeight; y++) {
        for (let x = 0; x < dstWidth; x++) {
            const srcX = Math.floor(x * xRatio);
            const srcY = Math.floor(y * yRatio);
            const srcIdx = (srcY * srcWidth + srcX) * 4;
            const dstIdx = (y * dstWidth + x) * 4;
            
            // Copy RGBA
            scaled[dstIdx] = pixels[srcIdx];
            scaled[dstIdx + 1] = pixels[srcIdx + 1];
            scaled[dstIdx + 2] = pixels[srcIdx + 2];
            scaled[dstIdx + 3] = pixels[srcIdx + 3];
        }
    }
    
    return scaled;
}

/**
 * Interpolate between two hex colors
 * position: 0 (color1) to 1 (color2)
 * Returns [r, g, b] array
 */
function interpolateColor(color1, color2, position) {
    // Clamp position to 0-1
    position = Math.max(0, Math.min(1, position));
    
    // Parse hex colors
    const r1 = parseInt(color1.substr(1, 2), 16);
    const g1 = parseInt(color1.substr(3, 2), 16);
    const b1 = parseInt(color1.substr(5, 2), 16);
    
    const r2 = parseInt(color2.substr(1, 2), 16);
    const g2 = parseInt(color2.substr(3, 2), 16);
    const b2 = parseInt(color2.substr(5, 2), 16);
    
    // Linear interpolation between colors
    return [
        Math.round(r1 + (r2 - r1) * position),
        Math.round(g1 + (g2 - g1) * position),
        Math.round(b1 + (b2 - b1) * position)
    ];
}

/**
 * Apply color mapping to dithered image
 * Transforms pixel luminance to user-selected color palette
 * Supports 4 modes: singleColor, 3color, 5color, custom
 */
function applyColorMapping(pixels, width, height, mode, settings) {
    console.log(`Applying color mapping: ${mode}`);
    
    // Build color lookup table for fast mapping
    const colorMap = {};
    
    try {
        if (mode === "singleColor") {
            // Map all pixels to shades of a single color
            // Black shadows → Selected highlight color
            for (let lum = 0; lum <= 255; lum++) {
                const ratio = lum / 255;
                const [r, g, b] = interpolateColor("#000000", settings.highlightColor, ratio);
                colorMap[lum] = [r, g, b];
            }
        } else if (mode === "3color") {
            // Classic duotone/tritone: shadows → midtones → highlights
            for (let lum = 0; lum <= 255; lum++) {
                let r, g, b;
                
                if (lum < 85) {
                    // Dark third: shadow to midtone (0-33%)
                    const ratio = lum / 85;
                    [r, g, b] = interpolateColor(settings.shadowColor, settings.midtoneColor, ratio);
                } else if (lum < 170) {
                    // Mid third: midtone to highlight (33-66%)
                    const ratio = (lum - 85) / 85;
                    [r, g, b] = interpolateColor(settings.midtoneColor, settings.highlightColor, ratio);
                } else {
                    // Light third: highlight region (66-100%)
                    const ratio = (lum - 170) / 85;
                    [r, g, b] = interpolateColor(settings.highlightColor, settings.highlightColor, ratio);
                }
                
                colorMap[lum] = [r, g, b];
            }
        } else if (mode === "5color") {
            // Rich gradient: 5-point color mapping for smooth transitions
            // Points at: 0% (shadows), 25%, 50% (midtones), 75%, 100% (highlights)
            
            // For now, use 3-color but with finer gradients
            // Could be extended to support 5 color inputs
            for (let lum = 0; lum <= 255; lum++) {
                let r, g, b;
                
                if (lum < 64) {
                    // Deepest shadows (0-25%)
                    const ratio = lum / 64;
                    [r, g, b] = interpolateColor(settings.shadowColor, settings.midtoneColor, ratio * 0.5);
                } else if (lum < 128) {
                    // Shadows to midtones (25-50%)
                    const ratio = (lum - 64) / 64;
                    [r, g, b] = interpolateColor(settings.midtoneColor, settings.midtoneColor, 0.5 + ratio * 0.5);
                } else if (lum < 192) {
                    // Midtones to highlights (50-75%)
                    const ratio = (lum - 128) / 64;
                    [r, g, b] = interpolateColor(settings.midtoneColor, settings.highlightColor, ratio);
                } else {
                    // Brightest highlights (75-100%)
                    const ratio = (lum - 192) / 64;
                    [r, g, b] = interpolateColor(settings.highlightColor, "#ffffff", ratio);
                }
                
                colorMap[lum] = [r, g, b];
            }
        } else if (mode === "custom") {
            // Custom mode: User-defined color points
            // For now, default to 3-color behavior
            // This would be extended to support up to 10 custom color points
            for (let lum = 0; lum <= 255; lum++) {
                let r, g, b;
                
                if (lum < 85) {
                    const ratio = lum / 85;
                    [r, g, b] = interpolateColor(settings.shadowColor, settings.midtoneColor, ratio);
                } else if (lum < 170) {
                    const ratio = (lum - 85) / 85;
                    [r, g, b] = interpolateColor(settings.midtoneColor, settings.highlightColor, ratio);
                } else {
                    const ratio = (lum - 170) / 85;
                    [r, g, b] = interpolateColor(settings.highlightColor, settings.highlightColor, ratio);
                }
                
                colorMap[lum] = [r, g, b];
            }
        }
        
        // Apply the color map to all pixels
        for (let i = 0; i < pixels.length; i += 4) {
            const origR = pixels[i];
            const origG = pixels[i + 1];
            const origB = pixels[i + 2];
            const alpha = pixels[i + 3];
            
            // Get the luminance of current pixel
            const lum = getLuminance(origR, origG, origB);
            
            // Map luminance to color from palette
            const [r, g, b] = colorMap[lum] || [0, 0, 0];
            
            // Replace RGB with mapped colors, keep alpha (dithering overlay intensity)
            pixels[i] = r;
            pixels[i + 1] = g;
            pixels[i + 2] = b;
            pixels[i + 3] = alpha;  // Keep alpha for overlay effect
        }
        
        console.log("Color mapping applied successfully");
    } catch (error) {
        console.error("Error applying color mapping:", error);
    }
}

/**
 * Show an alert dialog to the user
 */
export function showAlert(message) {
    try {
        app.showAlert(message);
    } catch (error) {
        console.error("Error showing alert:", error);
    }
}
