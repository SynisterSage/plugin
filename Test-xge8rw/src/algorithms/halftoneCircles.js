/**
 * Halftone Circles Algorithm
 * 
 * Creates a halftone effect using circular dots of varying sizes.
 * Dots are placed on a grid and sized based on local image luminance.
 * 
 * This approach:
 * 1. Samples the image at regular grid intervals
 * 2. Calculates luminance at each grid point
 * 3. Renders circles sized proportionally to luminance
 * 4. Maps luminance to dot size (dark = large, light = small)
 * 
 * Features:
 * - Fast processing compared to Voronoi stippling
 * - Natural-looking halftone effect
 * - Configurable grid spacing and dot size range
 * - Anti-aliased circular dots
 * - Smooth transitions between dot sizes
 */

/**
 * Calculate luminance from RGB color
 * Uses standard relative luminance formula
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {number} Luminance value (0-1)
 */
function getLuminance(r, g, b) {
    // Standard relative luminance calculation
    // https://www.w3.org/TR/WCAG20/#relativeluminancedef
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get average luminance in a region around a point
 * Uses weighted sampling for smoother results
 * @param {Uint8ClampedArray} data - Image pixel data (RGBA)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} sampleRadius - Radius for sampling region (in pixels)
 * @returns {number} Average luminance (0-1)
 */
function sampleLuminanceRegion(data, width, height, x, y, sampleRadius) {
    let totalLum = 0;
    let totalWeight = 0;
    
    const minX = Math.max(0, Math.floor(x - sampleRadius));
    const maxX = Math.min(width - 1, Math.ceil(x + sampleRadius));
    const minY = Math.max(0, Math.floor(y - sampleRadius));
    const maxY = Math.min(height - 1, Math.ceil(y + sampleRadius));
    
    for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
            const idx = (py * width + px) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = getLuminance(r, g, b);
            
            // Weight by distance (gaussian-like)
            const dx = px - x;
            const dy = py - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const weight = Math.exp(-(dist * dist) / (2 * sampleRadius * sampleRadius));
            
            totalLum += lum * weight;
            totalWeight += weight;
        }
    }
    
    return totalWeight > 0 ? totalLum / totalWeight : 0.5;
}

/**
 * Draw an anti-aliased circle on ImageData
 * Uses subpixel sampling for smooth edges
 * @param {Uint8ClampedArray} data - Image pixel data (RGBA)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} centerX - Circle center X
 * @param {number} centerY - Circle center Y
 * @param {number} radius - Circle radius
 * @param {number} brightness - Circle brightness (0-1)
 * @param {string} colorMode - Color mode for the dot
 */
function drawCircle(data, width, height, centerX, centerY, radius, brightness, colorMode) {
    const radiusSquared = radius * radius;
    const minX = Math.max(0, Math.floor(centerX - radius - 1));
    const maxX = Math.min(width - 1, Math.ceil(centerX + radius + 1));
    const minY = Math.max(0, Math.floor(centerY - radius - 1));
    const maxY = Math.min(height - 1, Math.ceil(centerY + radius + 1));
    
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSquared = dx * dx + dy * dy;
            
            if (distSquared <= radiusSquared) {
                // Anti-aliasing: smoothly fade edges
                const dist = Math.sqrt(distSquared);
                let alpha = 1.0;
                
                if (dist > radius - 1.0) {
                    // Feather edge over 1 pixel
                    alpha = 1.0 - (dist - (radius - 1.0));
                }
                
                const idx = (y * width + x) * 4;
                
                // Get target color based on mode
                let r, g, b;
                
                if (colorMode === "black-white") {
                    // Simple black dot
                    r = Math.round(255 * (1 - brightness * alpha));
                    g = r;
                    b = r;
                } else if (colorMode === "inverted") {
                    // Inverted: light dots on dark
                    r = Math.round(255 * brightness * alpha);
                    g = r;
                    b = r;
                } else if (colorMode === "original") {
                    // Preserve original colors, just adjust darkness
                    const origR = data[idx];
                    const origG = data[idx + 1];
                    const origB = data[idx + 2];
                    r = Math.round(origR * (1 - brightness * alpha * 0.5));
                    g = Math.round(origG * (1 - brightness * alpha * 0.5));
                    b = Math.round(origB * (1 - brightness * alpha * 0.5));
                } else {
                    // Default to black-white
                    r = Math.round(255 * (1 - brightness * alpha));
                    g = r;
                    b = r;
                }
                
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                // Keep alpha channel unchanged (full opacity for dots)
            }
        }
    }
}

/**
 * Apply halftone circles dithering to image data
 * Creates a newspaper-like halftone effect with circular dots
 * @param {Object} imageData - Image data object { data: Uint8ClampedArray, width: number, height: number }
 * @param {Object} options - Configuration options
 * @param {number} options.gridSpacing - Distance between sample points (default: 8)
 * @param {number} options.minDotSize - Minimum circle radius in pixels (default: 0.5)
 * @param {number} options.maxDotSize - Maximum circle radius in pixels (default: 8)
 * @param {number} options.intensity - Effect intensity 0-100 (default: 100)
 * @param {string} options.colorMode - Color mode: "black-white", "inverted", "original" (default: "black-white")
 * @returns {Object} Image data with halftone circles applied
 */
export function halftoneCircles(imageData, options = {}) {
    const {
        gridSpacing = 8,
        minDotSize = 0.5,
        maxDotSize = 8,
        intensity = 100,
        colorMode = "black-white"
    } = options;
    
    const { data: inputData, width, height } = imageData;
    
    // Create output buffer (white background)
    const outputData = new Uint8ClampedArray(inputData.length);
    for (let i = 0; i < outputData.length; i += 4) {
        outputData[i] = 255;     // R
        outputData[i + 1] = 255; // G
        outputData[i + 2] = 255; // B
        outputData[i + 3] = 255; // A (full opacity)
    }
    
    const intensityFactor = intensity / 100;
    const dotSizeRange = maxDotSize - minDotSize;
    const sampleRadius = gridSpacing / 2;
    
    // Create grid of sample points
    for (let py = gridSpacing / 2; py < height; py += gridSpacing) {
        for (let px = gridSpacing / 2; px < width; px += gridSpacing) {
            // Sample luminance at this grid point
            const luminance = sampleLuminanceRegion(inputData, width, height, px, py, sampleRadius);
            
            // Map luminance to dot size
            // Dark areas (low luminance) = large dots
            // Light areas (high luminance) = small dots
            const invertedLuminance = 1 - luminance;
            const dotRadius = minDotSize + (invertedLuminance * dotSizeRange);
            
            // Apply intensity modulation
            const adjustedRadius = dotRadius * intensityFactor;
            
            // Draw the circle
            if (adjustedRadius > 0.1) {
                drawCircle(outputData, width, height, px, py, adjustedRadius, luminance, colorMode);
            }
        }
    }
    
    return {
        data: outputData,
        width: width,
        height: height
    };
}

/**
 * Advanced Voronoi Stippling Implementation (Future Enhancement)
 * 
 * This is a placeholder for future advanced implementation using:
 * 1. Poisson disk sampling for initial points
 * 2. Lloyd's algorithm iteration (centroid relaxation)
 * 3. Weighted sampling based on image content
 * 4. Multiple iterations for optimization
 * 
 * Expected to provide higher visual quality but slower performance
 */
export function halftoneCirclesVoronoi(imageData, options = {}) {
    const {
        gridSpacing = 8,
        minDotSize = 0.5,
        maxDotSize = 8,
        iterations = 5,
        intensity = 100,
        colorMode = "black-white"
    } = options;
    
    // TODO: Implement full weighted Voronoi stippling
    // For now, fall back to simple halftone
    console.warn("Voronoi stippling not yet implemented, using simple halftone");
    
    return halftoneCircles(imageData, {
        gridSpacing,
        minDotSize,
        maxDotSize,
        intensity,
        colorMode
    });
}

/**
 * Poisson Disk Sampling Helper (for future Voronoi implementation)
 * Generates evenly distributed points with minimum distance constraint
 * Using Bridson's fast algorithm
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} minDistance - Minimum distance between points
 * @returns {Array} Array of [x, y] points
 */
export function poissonDiskSample(width, height, minDistance) {
    // TODO: Implement Bridson's Poisson disk sampling algorithm
    // This will be used for Voronoi initialization
    const points = [];
    const cellSize = minDistance / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid = Array(gridWidth * gridHeight).fill(null);
    
    const active = [];
    
    // Helper: add point if valid
    function addPoint(p) {
        active.push(p);
        const gridX = Math.floor(p[0] / cellSize);
        const gridY = Math.floor(p[1] / cellSize);
        grid[gridY * gridWidth + gridX] = p;
        return p;
    }
    
    // Start with random point
    addPoint([Math.random() * width, Math.random() * height]);
    
    while (active.length > 0) {
        const idx = Math.floor(Math.random() * active.length);
        const p = active[idx];
        let found = false;
        
        // Try up to 30 random candidates around this point
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const dist = minDistance * (1 + Math.random());
            const nx = p[0] + dist * Math.cos(angle);
            const ny = p[1] + dist * Math.sin(angle);
            
            // Check bounds
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const gridX = Math.floor(nx / cellSize);
                const gridY = Math.floor(ny / cellSize);
                
                // Check if far enough from existing points
                let valid = true;
                const searchStart = Math.max(0, gridY - 2);
                const searchEnd = Math.min(gridHeight, gridY + 3);
                const searchLeft = Math.max(0, gridX - 2);
                const searchRight = Math.min(gridWidth, gridX + 3);
                
                for (let sy = searchStart; sy < searchEnd && valid; sy++) {
                    for (let sx = searchLeft; sx < searchRight && valid; sx++) {
                        const neighbor = grid[sy * gridWidth + sx];
                        if (neighbor) {
                            const dx = neighbor[0] - nx;
                            const dy = neighbor[1] - ny;
                            if (dx * dx + dy * dy < minDistance * minDistance) {
                                valid = false;
                            }
                        }
                    }
                }
                
                if (valid) {
                    found = true;
                    addPoint([nx, ny]);
                }
            }
        }
        
        if (!found) {
            active.splice(idx, 1);
        }
    }
    
    return points;
}
