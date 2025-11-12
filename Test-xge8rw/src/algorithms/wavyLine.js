/**
 * Wavy Line Ridge Pattern Dithering Algorithm
 * 
 * Creates a fingerprint-like ridge pattern dither that follows the image's
 * gradient direction, with wavy lines that vary in density based on brightness.
 * 
 * This algorithm:
 * 1. Computes gradient field (Sobel operator)
 * 2. Determines ridge orientation from gradients
 * 3. Renders wavy parallel lines following the orientation
 * 4. Modulates line spacing and amplitude by pixel brightness
 * 5. Maps colors through purple-to-blue gradient
 */

/**
 * Compute Sobel gradients for edge/direction detection
 * @param {Uint8ClampedArray} data - Image pixel data (RGBA)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} { gx, gy, angles, magnitudes } - Gradient components
 */
function computeSobelGradients(data, width, height) {
    const gx = new Float32Array(width * height);
    const gy = new Float32Array(width * height);
    const angles = new Float32Array(width * height);
    const magnitudes = new Float32Array(width * height);

    // Sobel kernels
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    // Convert RGBA to grayscale and apply Sobel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumX = 0;
            let sumY = 0;

            // Apply Sobel kernels
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const px = x + kx;
                    const py = y + ky;
                    const idx = (py * width + px) * 4;

                    // Get luminance (R*0.299 + G*0.587 + B*0.114)
                    const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

                    sumX += sobelX[ky + 1][kx + 1] * lum;
                    sumY += sobelY[ky + 1][kx + 1] * lum;
                }
            }

            const idx = (y * width + x);
            gx[idx] = sumX;
            gy[idx] = sumY;

            // Calculate angle (perpendicular to gradient for ridge direction)
            // Ridges are perpendicular to the gradient direction
            const angle = Math.atan2(gy[idx], gx[idx]);
            angles[idx] = angle;

            // Calculate magnitude
            magnitudes[idx] = Math.sqrt(sumX * sumX + sumY * sumY);
        }
    }

    // Fill borders with nearest values
    for (let i = 0; i < width; i++) {
        angles[i] = angles[width + i];
        magnitudes[i] = magnitudes[width + i];

        const bottomTop = (height - 1) * width + i;
        const secondLast = (height - 2) * width + i;
        angles[bottomTop] = angles[secondLast];
        magnitudes[bottomTop] = magnitudes[secondLast];
    }

    for (let i = 0; i < height; i++) {
        const leftCol = i * width;
        const secondCol = i * width + 1;
        angles[leftCol] = angles[secondCol];
        magnitudes[leftCol] = magnitudes[secondCol];

        const rightCol = i * width + width - 1;
        const secondRight = i * width + width - 2;
        angles[rightCol] = angles[secondRight];
        magnitudes[rightCol] = magnitudes[secondRight];
    }

    return { gx, gy, angles, magnitudes };
}

/**
 * Create purple-to-cyan color gradient
 * @param {number} brightness - 0-255
 * @returns {Array} [r, g, b, a]
 */
function colorFromBrightness(brightness) {
    // Normalize brightness to 0-1
    const t = Math.max(0, Math.min(1, brightness / 255));

    // Purple (#2d1b69) to Cyan (#00d4ff)
    // Purple: R=45, G=27, B=105
    // Cyan:   R=0,  G=212, B=255
    
    const r = Math.round(45 * (1 - t) + 0 * t);
    const g = Math.round(27 * (1 - t) + 212 * t);
    const b = Math.round(105 * (1 - t) + 255 * t);

    return [r, g, b];
}

/**
 * Apply Wavy Line ridge pattern dithering
 * Creates fingerprint-like ridge patterns that overlay the original image
 * @param {Object} imageDataObj - Object with {data: Uint8ClampedArray, width: number, height: number}
 * @param {Object} config - Configuration object
 * @param {number} config.ridgeSpacing - Base spacing between ridges (2-8, default: 3)
 * @param {number} config.waveAmplitude - Wave deviation amount (0.5-2, default: 1.2)
 * @param {number} config.intensity - Dithering intensity (0-100, default: 100)
 * @param {string} config.colorMode - 'purple-blue' or 'bw' (default: 'purple-blue')
 * @returns {Object} - {data: Uint8ClampedArray, width: number, height: number}
 */
export function wavyLine(imageDataObj, config = {}) {
    const {
        ridgeSpacing = 3,
        waveAmplitude = 1.2,
        intensity = 100,
        colorMode = 'purple-blue'
    } = config;

    const { width, height, data } = imageDataObj;
    const outputData = new Uint8ClampedArray(data);
    const intensityFactor = intensity / 100;

    // Compute gradient field for ridge orientation
    const { angles, magnitudes } = computeSobelGradients(data, width, height);

    // First pass: Clear all to transparent
    for (let i = 0; i < outputData.length; i += 4) {
        outputData[i + 3] = 0; // Set all pixels to transparent initially
    }

    // Create wavy ridge lines using line-drawing approach
    // Generate ridge centerlines and draw them with proper width
    const ridgeLines = [];
    
    // Sample points along the image to create ridge centerlines
    const sampleSpacing = Math.ceil(Math.max(ridgeSpacing, 2));
    
    for (let startY = -height; startY < height * 2; startY += Math.max(sampleSpacing, 1)) {
        for (let x = 0; x < width; x += sampleSpacing) {
            const y = startY + x * 0.3; // Slight angle to create natural flow
            
            if (y >= 0 && y < height) {
                const brightIdx = Math.floor((y * width + x) * 4);
                if (brightIdx >= 0 && brightIdx < data.length) {
                    const brightness = data[brightIdx] * 0.299 + data[brightIdx + 1] * 0.587 + data[brightIdx + 2] * 0.114;
                    const normalizedBrightness = brightness / 255;
                    
                    // Store ridge line info
                    ridgeLines.push({
                        x: x,
                        y: y,
                        brightness: brightness,
                        normalizedBrightness: normalizedBrightness
                    });
                }
            }
        }
    }

    // Draw ridge lines across the image
    for (let lineIdx = 0; lineIdx < height; lineIdx += Math.max(sampleSpacing * 0.7, 2)) {
        for (let x = 0; x < width; x++) {
            const y = lineIdx;
            
            if (y >= 0 && y < height) {
                const idx = (Math.floor(y) * width + x) * 4;
                
                if (idx >= 0 && idx + 3 < outputData.length) {
                    const brightness = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                    const normalizedBrightness = brightness / 255;
                    
                    // Add wave to the line
                    const waveOffset = waveAmplitude * Math.sin((x / Math.max(ridgeSpacing, 1)) * Math.PI * 2) * 2;
                    const adjustedY = y + waveOffset;
                    
                    // Draw line with anti-aliasing effect
                    const linePixels = Math.max(2, 3 - normalizedBrightness);
                    
                    for (let dy = -linePixels; dy <= linePixels; dy++) {
                        const drawY = Math.floor(adjustedY + dy);
                        if (drawY >= 0 && drawY < height) {
                            const drawIdx = (drawY * width + x) * 4;
                            if (drawIdx + 3 < outputData.length) {
                                const ridgeColor = colorFromBrightness(brightness);
                                
                                // Fade the line edges for anti-aliasing
                                const edgeFade = Math.max(0, 1 - Math.abs(dy) / linePixels);
                                const alpha = Math.round(intensityFactor * 255 * edgeFade);
                                
                                outputData[drawIdx] = Math.round(data[drawIdx] * (1 - intensityFactor * edgeFade) + ridgeColor[0] * intensityFactor * edgeFade);
                                outputData[drawIdx + 1] = Math.round(data[drawIdx + 1] * (1 - intensityFactor * edgeFade) + ridgeColor[1] * intensityFactor * edgeFade);
                                outputData[drawIdx + 2] = Math.round(data[drawIdx + 2] * (1 - intensityFactor * edgeFade) + ridgeColor[2] * intensityFactor * edgeFade);
                                outputData[drawIdx + 3] = Math.max(outputData[drawIdx + 3], alpha);
                            }
                        }
                    }
                }
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
 * Generate a sample wavy line pattern for preview
 * Creates a gradient and applies the effect to show the pattern
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} config - Configuration object (same as wavyLine)
 * @returns {Object} - {data: Uint8ClampedArray, width: number, height: number}
 */
export function generateSampleWavyLine(width, height, config = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create a gradient for preview
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#888888');
    gradient.addColorStop(1, '#ffffff');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Get the image data and apply dithering
    const imageData = ctx.getImageData(0, 0, width, height);
    const dithered = wavyLine(imageData, {
        ridgeSpacing: config.ridgeSpacing || 3,
        waveAmplitude: config.waveAmplitude || 1.2,
        intensity: config.intensity || 100,
        colorMode: config.colorMode || 'purple-blue'
    });

    // Convert back to canvas ImageData format for compatibility
    if (typeof ImageData !== 'undefined') {
        return new ImageData(dithered.data, dithered.width, dithered.height);
    } else {
        return dithered;
    }
}
