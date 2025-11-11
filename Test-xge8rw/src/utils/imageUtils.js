/**
 * Image processing utilities for pre-processing before dithering
 */

/**
 * Apply brightness adjustment to image data
 * @param {ImageData} imageData - Input image
 * @param {number} brightness - Brightness adjustment (-100 to 100)
 * @returns {ImageData} - Adjusted image
 */
export function applyBrightness(imageData, brightness) {
    if (brightness === 0) return imageData;
    
    const { data, width, height } = imageData;
    const amount = (brightness / 100) * 255;
    
    for (let i = 0; i < data.length; i += 4) {
        // Skip alpha channel
        data[i] = Math.max(0, Math.min(255, data[i] + amount));     // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + amount)); // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + amount)); // B
    }
    
    return imageData;
}

/**
 * Apply contrast adjustment to image data
 * @param {ImageData} imageData - Input image
 * @param {number} contrast - Contrast adjustment (-100 to 100)
 * @returns {ImageData} - Adjusted image
 */
export function applyContrast(imageData, contrast) {
    if (contrast === 0) return imageData;
    
    const { data } = imageData;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // R
        data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // G
        data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // B
    }
    
    return imageData;
}

/**
 * Convert RGB to Grayscale
 * @param {ImageData} imageData - Input image
 * @returns {ImageData} - Grayscale image
 */
export function toGrayscale(imageData) {
    const { data, width, height } = imageData;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Luminance formula
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        data[i] = gray;     // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
    }
    
    return imageData;
}

/**
 * Preprocess image with all adjustments
 * @param {ImageData} imageData - Input image
 * @param {object} settings - Settings with brightness, contrast, etc.
 * @returns {ImageData} - Preprocessed image
 */
export function preprocessImage(imageData, settings) {
    let processed = imageData;
    
    // Apply brightness
    if (settings.brightness !== 0) {
        processed = applyBrightness(processed, settings.brightness);
    }
    
    // Apply contrast
    if (settings.contrast !== 0) {
        processed = applyContrast(processed, settings.contrast);
    }
    
    return processed;
}
