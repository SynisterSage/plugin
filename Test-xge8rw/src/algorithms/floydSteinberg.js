/**
 * Floyd-Steinberg Dithering Algorithm
 * 
 * This algorithm distributes quantization error to neighboring pixels:
 *       X   7/16
 *   3/16 5/16 1/16
 * 
 * Where X is the current pixel
 */

/**
 * Quantize a color value to a specific bit depth
 * @param {number} value - Color value (0-255)
 * @param {number} levels - Number of color levels (e.g., 2, 4, 8, 16, 256)
 * @returns {number} - Quantized value
 */
function quantize(value, levels) {
    const step = 255 / (levels - 1);
    return Math.round(Math.round(value / step) * step);
}

/**
 * Apply Floyd-Steinberg dithering to image data
 * @param {ImageData} imageData - Canvas ImageData object
 * @param {number} colorDepth - Bits per channel (1-8)
 * @param {number} intensity - Dithering intensity (0-100)
 * @returns {ImageData} - Dithered ImageData
 */
export function floydSteinberg(imageData, colorDepth = 8, intensity = 100) {
    const { width, height, data } = imageData;
    const levels = Math.pow(2, colorDepth);
    const intensityFactor = intensity / 100;
    
    // Create a copy of the data to work with
    const outputData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Process each color channel (R, G, B)
            for (let channel = 0; channel < 3; channel++) {
                const oldPixel = outputData[idx + channel];
                const newPixel = quantize(oldPixel, levels);
                const error = (oldPixel - newPixel) * intensityFactor;
                
                outputData[idx + channel] = newPixel;
                
                // Distribute error to neighboring pixels
                if (x + 1 < width) {
                    // Right pixel: 7/16
                    const rightIdx = (y * width + (x + 1)) * 4 + channel;
                    outputData[rightIdx] = Math.max(0, Math.min(255, 
                        outputData[rightIdx] + error * (7/16)
                    ));
                }
                
                if (y + 1 < height) {
                    if (x > 0) {
                        // Bottom-left pixel: 3/16
                        const blIdx = ((y + 1) * width + (x - 1)) * 4 + channel;
                        outputData[blIdx] = Math.max(0, Math.min(255, 
                            outputData[blIdx] + error * (3/16)
                        ));
                    }
                    
                    // Bottom pixel: 5/16
                    const bottomIdx = ((y + 1) * width + x) * 4 + channel;
                    outputData[bottomIdx] = Math.max(0, Math.min(255, 
                        outputData[bottomIdx] + error * (5/16)
                    ));
                    
                    if (x + 1 < width) {
                        // Bottom-right pixel: 1/16
                        const brIdx = ((y + 1) * width + (x + 1)) * 4 + channel;
                        outputData[brIdx] = Math.max(0, Math.min(255, 
                            outputData[brIdx] + error * (1/16)
                        ));
                    }
                }
            }
        }
    }
    
    // Create and return new ImageData
    return new ImageData(outputData, width, height);
}

/**
 * Generate a sample dithered pattern for preview
 * Creates a gradient that shows the dithering effect
 */
export function generateSampleDither(width, height, colorDepth, intensity) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#888888');
    gradient.addColorStop(1, '#ffffff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Get the image data and apply dithering
    const imageData = ctx.getImageData(0, 0, width, height);
    const dithered = floydSteinberg(imageData, colorDepth, intensity);
    
    return dithered;
}
