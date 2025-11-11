import React, { useEffect, useRef } from "react";

export const PreviewCanvas = ({ algorithm, intensity, colorDepth }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        
        try {
            // UXP Canvas has limited support - use simple gradient and rectangles
            // to simulate dithering pattern
            
            // Clear background
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Create a simple dithering pattern visualization
            const levels = Math.pow(2, colorDepth);
            const cellSize = Math.max(2, 8 - colorDepth); // Smaller cells for higher bit depth
            
            for (let y = 0; y < canvas.height; y += cellSize) {
                for (let x = 0; x < canvas.width; x += cellSize) {
                    // Create gradient from left to right
                    const gradientValue = x / canvas.width;
                    
                    // Quantize based on color depth
                    const quantized = Math.floor(gradientValue * levels) / levels;
                    
                    // Add dithering pattern
                    const threshold = ((x / cellSize + y / cellSize) % 2) * 0.5 / levels;
                    const adjusted = Math.min(1, Math.max(0, quantized + threshold * (intensity / 100)));
                    
                    // Convert to gray value
                    const gray = Math.floor(adjusted * 255);
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
            
            // Add info text overlay (using simple rectangles since fillText isn't supported)
            // We'll show the info in the UI instead
            
        } catch (error) {
            console.error("Error rendering preview:", error);
            
            // Show error with basic rectangle
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(10, 10, canvas.width - 20, 30);
        }

    }, [algorithm, intensity, colorDepth]);

    return (
        <div className="preview-canvas-container">
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={200}
                className="preview-canvas"
            />
            <div className="preview-info">
                <span className="preview-label">{algorithm}</span>
                <span className="preview-params">
                    {colorDepth}bit • {intensity}% intensity
                </span>
            </div>
        </div>
    );
};
