import React, { useState, useEffect } from "react";
import { getActiveDocument, getLayerPixelData, renderDitheredResult, showAlert } from "../services/photoshop.js";
import { floydSteinberg } from "../algorithms/floydSteinberg.js";
import { ColorWheel } from "../components/ColorWheel.jsx";

export const DitherPanel = () => {
    // Render Settings
    const [inputDPI, setInputDPI] = useState(72);
    const [ditherIntensity, setDitherIntensity] = useState(100);
    const [dotSize, setDotSize] = useState(1);
    const [resampling, setResampling] = useState("preserve");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("floyd-steinberg");
    const [colorDepth, setColorDepth] = useState(3);

    // Wavy Line Controls (Fingerprint Ridge Pattern)
    const [ridgeSpacing, setRidgeSpacing] = useState(3);
    const [waveAmplitude, setWaveAmplitude] = useState(1.2);
    const [wavyLineColorMode, setWavyLineColorMode] = useState("purple-blue");

    // Halftone Circles Controls
    const [halftoneGridSpacing, setHalftoneGridSpacing] = useState(8);
    const [halftoneMinDot, setHalftoneMinDot] = useState(0.5);
    const [halftoneMaxDot, setHalftoneMaxDot] = useState(8);
    const [halftoneColorMode, setHalftoneColorMode] = useState("black-white");

    // Effect Controls
    const [sharpenStrength, setSharpenStrength] = useState(0);
    const [sharpenRadius, setSharpenRadius] = useState(1);
    const [noise, setNoise] = useState(0);
    const [denoise, setDenoise] = useState(0);
    const [blur, setBlur] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [threshold, setThreshold] = useState(128);
    const [vibrance, setVibrance] = useState(0);
    const [posterize, setPosterize] = useState(256);

    // Tonal Controls
    const [tonalMappingType, setTonalMappingType] = useState("singleColor");
    const [highlightColor, setHighlightColor] = useState("#ffffff");
    const [midtoneColor, setMidtoneColor] = useState("#808080");
    const [shadowColor, setShadowColor] = useState("#000000");

    // Background
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    // Layer Detection
    const [selectedLayerName, setSelectedLayerName] = useState(null);
    const [isLayerValid, setIsLayerValid] = useState(false);
    const [layerWarningActive, setLayerWarningActive] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);

    // Preset definitions
    const presets = {
        default: {
            name: "Default",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            threshold: 128,
            ditherIntensity: 100,
            dotSize: 1,
            sharpenStrength: 0,
            sharpenRadius: 1,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 0,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
        },
        classic: {
            name: "Classic Newspaper",
            algorithm: "ordered-4x4",
            colorDepth: 2,
            threshold: 128,
            ditherIntensity: 100,
            dotSize: 2,
            sharpenStrength: 0,
            sharpenRadius: 1,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 10,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
        },
        wavyLine: {
            name: "Wavy Line (Fingerprint Ridge)",
            algorithm: "wavy-line",
            colorDepth: 3,
            ditherIntensity: 100,
            dotSize: 1,
            sharpenStrength: 35,
            sharpenRadius: 2,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 40,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
            ridgeSpacing: 3,
            waveAmplitude: 1.2,
            wavyLineColorMode: "purple-blue"
        },
        fingerprint: {
            name: "Fingerprint (Purple)",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            threshold: 120,
            ditherIntensity: 100,
            dotSize: 4,
            sharpenStrength: 65,
            sharpenRadius: 2,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 55,
            vibrance: 30,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#000000",
            midtoneColor: "#8844cc",
            highlightColor: "#ff99ff"
        },
        fine: {
            name: "Fine Detail",
            algorithm: "stucki",
            colorDepth: 4,
            ditherIntensity: 100,
            dotSize: 1,
            sharpenStrength: 20,
            sharpenRadius: 1,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 5,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
        },
        artistic: {
            name: "Artistic",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 80,
            dotSize: 2,
            sharpenStrength: 10,
            sharpenRadius: 1,
            noise: 5,
            denoise: 0,
            blur: 1,
            brightness: 5,
            contrast: 15,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
        },
        glitch: {
            name: "Extreme Glitch",
            algorithm: "ordered-8x8",
            colorDepth: 1,
            ditherIntensity: 100,
            dotSize: 6,
            sharpenStrength: 100,
            sharpenRadius: 3,
            noise: 20,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 85,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "singleColor",
            shadowColor: "#000000",
            midtoneColor: "#ff00ff",
            highlightColor: "#ffffff",
        },
        ocean: {
            name: "Ocean Blue",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 90,
            dotSize: 1,
            sharpenStrength: 15,
            sharpenRadius: 1,
            noise: 2,
            denoise: 1,
            blur: 1,
            brightness: 5,
            contrast: 25,
            vibrance: 30,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#001a4d",
            midtoneColor: "#0066cc",
            highlightColor: "#66e6ff",
        },
        sunset: {
            name: "Sunset",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 95,
            dotSize: 2,
            sharpenStrength: 30,
            sharpenRadius: 2,
            noise: 3,
            denoise: 0,
            blur: 0,
            brightness: 10,
            contrast: 40,
            vibrance: 40,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330000",
            midtoneColor: "#ff6600",
            highlightColor: "#ffcc00",
        },
        forest: {
            name: "Forest Green",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 100,
            dotSize: 2,
            sharpenStrength: 20,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 1,
            brightness: -5,
            contrast: 30,
            vibrance: 20,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#0a2a0a",
            midtoneColor: "#228B22",
            highlightColor: "#90EE90",
        },
        cyberpunk: {
            name: "Cyberpunk",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 75,
            sharpenRadius: 2,
            noise: 8,
            denoise: 0,
            blur: 0,
            brightness: 5,
            contrast: 70,
            vibrance: 80,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#000000",
            midtoneColor: "#00ff00",
            highlightColor: "#ffff00",
        },
        vintage: {
            name: "Vintage Film",
            algorithm: "ordered-4x4",
            colorDepth: 3,
            ditherIntensity: 85,
            dotSize: 2,
            sharpenStrength: 5,
            sharpenRadius: 1,
            noise: 4,
            denoise: 2,
            blur: 2,
            brightness: 8,
            contrast: 15,
            vibrance: -30,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#4a3728",
            midtoneColor: "#c9a877",
            highlightColor: "#f5e6d3",
        },
        noir: {
            name: "Film Noir",
            algorithm: "threshold",
            colorDepth: 1,
            threshold: 200,
            ditherIntensity: 100,
            dotSize: 1,
            sharpenStrength: 50,
            sharpenRadius: 1,
            noise: 0,
            denoise: 3,
            blur: 0,
            brightness: 0,
            contrast: 80,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "singleColor",
            shadowColor: "#000000",
            midtoneColor: "#ffffff",
            highlightColor: "#ffffff",
        },
        rose: {
            name: "Rose Gold",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 92,
            dotSize: 1,
            sharpenStrength: 25,
            sharpenRadius: 1,
            noise: 1,
            denoise: 0,
            blur: 0,
            brightness: 5,
            contrast: 20,
            vibrance: 50,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#4a2235",
            midtoneColor: "#b76e79",
            highlightColor: "#f4c2c2",
        },
        cosmic: {
            name: "Cosmic Purple",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 95,
            dotSize: 2,
            sharpenStrength: 40,
            sharpenRadius: 2,
            noise: 5,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 50,
            vibrance: 60,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#1a0033",
            midtoneColor: "#6600ff",
            highlightColor: "#ff00ff",
        },
        mint: {
            name: "Mint Fresh",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 88,
            dotSize: 1,
            sharpenStrength: 12,
            sharpenRadius: 1,
            noise: 1,
            denoise: 1,
            blur: 1,
            brightness: 10,
            contrast: 15,
            vibrance: 40,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#001a1a",
            midtoneColor: "#00cc99",
            highlightColor: "#ccffee",
        },
        fire: {
            name: "Fire Red",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 55,
            sharpenRadius: 2,
            noise: 6,
            denoise: 0,
            blur: 0,
            brightness: 5,
            contrast: 65,
            vibrance: 70,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330000",
            midtoneColor: "#ff3300",
            highlightColor: "#ffff00",
        },
        lavender: {
            name: "Lavender Dream",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 90,
            dotSize: 1,
            sharpenStrength: 18,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 1,
            brightness: 8,
            contrast: 22,
            vibrance: 45,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330033",
            midtoneColor: "#9966cc",
            highlightColor: "#e6ccff",
        },
        ink: {
            name: "Ink Bleed",
            algorithm: "atkinson",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 2,
            sharpenStrength: 35,
            sharpenRadius: 2,
            noise: 3,
            denoise: 0,
            blur: 0,
            brightness: -5,
            contrast: 45,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "singleColor",
            shadowColor: "#000000",
            midtoneColor: "#1a1a4d",
            highlightColor: "#ffffff",
        },
        sand: {
            name: "Desert Sand",
            algorithm: "ordered-4x4",
            colorDepth: 3,
            ditherIntensity: 85,
            dotSize: 2,
            sharpenStrength: 10,
            sharpenRadius: 1,
            noise: 3,
            denoise: 1,
            blur: 2,
            brightness: 15,
            contrast: 25,
            vibrance: 25,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#664422",
            midtoneColor: "#cc9966",
            highlightColor: "#ffdd99",
        },
        steel: {
            name: "Steel Blue",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 95,
            dotSize: 1,
            sharpenStrength: 28,
            sharpenRadius: 1,
            noise: 0,
            denoise: 2,
            blur: 0,
            brightness: 2,
            contrast: 35,
            vibrance: 15,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#1a2a3a",
            midtoneColor: "#4a7a9a",
            highlightColor: "#9abadc",
        },
        cherry: {
            name: "Cherry Blossom",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 92,
            dotSize: 2,
            sharpenStrength: 22,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 6,
            contrast: 28,
            vibrance: 55,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330011",
            midtoneColor: "#ff66aa",
            highlightColor: "#ffccdd",
        },
        midnight: {
            name: "Midnight",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 60,
            sharpenRadius: 2,
            noise: 4,
            denoise: 0,
            blur: 0,
            brightness: -10,
            contrast: 75,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "singleColor",
            shadowColor: "#000000",
            midtoneColor: "#0033ff",
            highlightColor: "#ffffff",
        },
        gold: {
            name: "Gold Foil",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 93,
            dotSize: 2,
            sharpenStrength: 32,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 10,
            contrast: 38,
            vibrance: 35,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#331100",
            midtoneColor: "#ffaa00",
            highlightColor: "#ffee99",
        },
        indigo: {
            name: "Indigo Dye",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 94,
            dotSize: 1,
            sharpenStrength: 26,
            sharpenRadius: 1,
            noise: 1,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 40,
            vibrance: 45,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#003366",
            midtoneColor: "#0066ff",
            highlightColor: "#99ccff",
        },
        eclipse: {
            name: "Eclipse",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 70,
            sharpenRadius: 2,
            noise: 5,
            denoise: 0,
            blur: 0,
            brightness: -15,
            contrast: 80,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#000000",
            midtoneColor: "#333333",
            highlightColor: "#ffff00",
        },
        aqua: {
            name: "Aqua",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 89,
            dotSize: 2,
            sharpenStrength: 20,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 1,
            brightness: 8,
            contrast: 32,
            vibrance: 35,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#001a33",
            midtoneColor: "#00ccff",
            highlightColor: "#99ffff",
        },
        crimson: {
            name: "Crimson",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 96,
            dotSize: 2,
            sharpenStrength: 38,
            sharpenRadius: 1,
            noise: 3,
            denoise: 0,
            blur: 0,
            brightness: 2,
            contrast: 48,
            vibrance: 50,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330000",
            midtoneColor: "#cc0000",
            highlightColor: "#ff6666",
        },
        slate: {
            name: "Slate",
            algorithm: "ordered-4x4",
            colorDepth: 3,
            ditherIntensity: 87,
            dotSize: 2,
            sharpenStrength: 15,
            sharpenRadius: 1,
            noise: 1,
            denoise: 1,
            blur: 1,
            brightness: -3,
            contrast: 28,
            vibrance: 10,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#1a1f2e",
            midtoneColor: "#4a5a7a",
            highlightColor: "#9aaccc",
        },
        cream: {
            name: "Cream",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 88,
            dotSize: 1,
            sharpenStrength: 10,
            sharpenRadius: 1,
            noise: 1,
            denoise: 1,
            blur: 1,
            brightness: 12,
            contrast: 18,
            vibrance: -20,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#3a3020",
            midtoneColor: "#d9c9a8",
            highlightColor: "#f5ead0",
        },
        plum: {
            name: "Plum",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 91,
            dotSize: 2,
            sharpenStrength: 24,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 3,
            contrast: 35,
            vibrance: 40,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#2a1a3a",
            midtoneColor: "#7a4a8a",
            highlightColor: "#cc99dd",
        },
        emerald: {
            name: "Emerald",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 42,
            sharpenRadius: 2,
            noise: 3,
            denoise: 0,
            blur: 0,
            brightness: 4,
            contrast: 52,
            vibrance: 50,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#001a1a",
            midtoneColor: "#009966",
            highlightColor: "#66ff99",
        },
        copper: {
            name: "Copper",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 90,
            dotSize: 2,
            sharpenStrength: 28,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 7,
            contrast: 42,
            vibrance: 30,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#331a00",
            midtoneColor: "#cc6600",
            highlightColor: "#ffcc99",
        },
        mauve: {
            name: "Mauve",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 89,
            dotSize: 1,
            sharpenStrength: 19,
            sharpenRadius: 1,
            noise: 1,
            denoise: 0,
            blur: 1,
            brightness: 5,
            contrast: 26,
            vibrance: 35,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#2a1a3a",
            midtoneColor: "#9966bb",
            highlightColor: "#e6ccff",
        },
        charcoal: {
            name: "Charcoal",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 2,
            sharpenStrength: 55,
            sharpenRadius: 1,
            noise: 0,
            denoise: 2,
            blur: 0,
            brightness: -8,
            contrast: 68,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "singleColor",
            shadowColor: "#000000",
            midtoneColor: "#333333",
            highlightColor: "#ffffff",
        },
        peach: {
            name: "Peach",
            algorithm: "jarvis-judice-ninke",
            colorDepth: 3,
            ditherIntensity: 91,
            dotSize: 2,
            sharpenStrength: 21,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 9,
            contrast: 30,
            vibrance: 40,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#330011",
            midtoneColor: "#ff9966",
            highlightColor: "#ffddaa",
        },
        olive: {
            name: "Olive",
            algorithm: "stucki",
            colorDepth: 3,
            ditherIntensity: 86,
            dotSize: 2,
            sharpenStrength: 16,
            sharpenRadius: 1,
            noise: 2,
            denoise: 1,
            blur: 1,
            brightness: 0,
            contrast: 24,
            vibrance: 20,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#1a1a0a",
            midtoneColor: "#669966",
            highlightColor: "#ccff99",
        },
        twilight: {
            name: "Twilight",
            algorithm: "ordered-8x8",
            colorDepth: 2,
            ditherIntensity: 100,
            dotSize: 3,
            sharpenStrength: 48,
            sharpenRadius: 2,
            noise: 4,
            denoise: 0,
            blur: 0,
            brightness: -5,
            contrast: 58,
            vibrance: 50,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#1a0033",
            midtoneColor: "#6633ff",
            highlightColor: "#ff99ff",
        },
        heatmap: {
            name: "Heatmap",
            algorithm: "floyd-steinberg",
            colorDepth: 3,
            ditherIntensity: 95,
            dotSize: 1,
            sharpenStrength: 35,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 55,
            vibrance: 80,
            posterize: 256,
            tonalMappingType: "3color",
            shadowColor: "#0000ff",
            midtoneColor: "#ffff00",
            highlightColor: "#ff0000",
        },
        halftoneNewspaper: {
            name: "Newspaper Halftone",
            algorithm: "halftone-circles",
            colorDepth: 8,
            ditherIntensity: 100,
            dotSize: 1,
            sharpenStrength: 5,
            sharpenRadius: 1,
            noise: 0,
            denoise: 0,
            blur: 0,
            brightness: 0,
            contrast: 10,
            vibrance: 0,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
            halftoneGridSpacing: 8,
            halftoneMinDot: 0.5,
            halftoneMaxDot: 8,
            halftoneColorMode: "black-white"
        },
        halftoneArtistic: {
            name: "Artistic Halftone",
            algorithm: "halftone-circles",
            colorDepth: 8,
            ditherIntensity: 85,
            dotSize: 1,
            sharpenStrength: 15,
            sharpenRadius: 1,
            noise: 2,
            denoise: 0,
            blur: 1,
            brightness: 5,
            contrast: 20,
            vibrance: 15,
            posterize: 256,
            tonalMappingType: "none",
            shadowColor: "#000000",
            midtoneColor: "#808080",
            highlightColor: "#ffffff",
            halftoneGridSpacing: 10,
            halftoneMinDot: 0.8,
            halftoneMaxDot: 7,
            halftoneColorMode: "black-white"
        },
    };

    // Check for active layer selection (runs periodically)
    useEffect(() => {
        const checkLayerSelection = () => {
            try {
                const doc = getActiveDocument();
                if (!doc || !doc.activeLayers || doc.activeLayers.length === 0) {
                    setSelectedLayerName(null);
                    setIsLayerValid(false);
                    return;
                }

                const layer = doc.activeLayers[0];
                
                // Check if it's a group (we can't work with groups)
                if (layer.kind === "group") {
                    setSelectedLayerName(`${layer.name} (Group)`);
                    setIsLayerValid(false);
                    return;
                }

                // Allow smart objects, adjustment layers, and pixel layers
                // The renderDitheredResult function will handle rasterization if needed
                setSelectedLayerName(layer.name);
                setIsLayerValid(true);
            } catch (error) {
                console.error("Error checking layer:", error);
                setSelectedLayerName(null);
                setIsLayerValid(false);
            }
        };

        // Check immediately
        checkLayerSelection();

        // Check every 500ms for layer changes
        const interval = setInterval(checkLayerSelection, 500);
        return () => clearInterval(interval);
    }, []);

    const applyPreset = (presetKey) => {
        const preset = presets[presetKey];
        setSelectedAlgorithm(preset.algorithm);
        setColorDepth(preset.colorDepth);
        setDitherIntensity(preset.ditherIntensity);
        setDotSize(preset.dotSize);
        setSharpenStrength(preset.sharpenStrength);
        setSharpenRadius(preset.sharpenRadius);
        setNoise(preset.noise);
        setDenoise(preset.denoise);
        setBlur(preset.blur);
        setBrightness(preset.brightness);
        setContrast(preset.contrast);
        setThreshold(preset.threshold !== undefined ? preset.threshold : 128);
        setVibrance(preset.vibrance || 0);
        setPosterize(preset.posterize || 256);
        setTonalMappingType(preset.tonalMappingType);
        setShadowColor(preset.shadowColor);
        setMidtoneColor(preset.midtoneColor);
        setHighlightColor(preset.highlightColor);
        // Wavy line specific settings
        if (preset.ridgeSpacing !== undefined) setRidgeSpacing(preset.ridgeSpacing);
        if (preset.waveAmplitude !== undefined) setWaveAmplitude(preset.waveAmplitude);
        if (preset.wavyLineColorMode !== undefined) setWavyLineColorMode(preset.wavyLineColorMode);
    };

    const handleRender = async () => {
        setIsProcessing(true);
        
        try {
            // Validate document
            const doc = getActiveDocument();
            if (!doc) {
                showAlert("Please open an image in Photoshop first.");
                setIsProcessing(false);
                return;
            }

            showAlert("Processing... This may take a moment.");

            const settings = {
                algorithm: selectedAlgorithm,
                colorDepth,
                inputDPI,
                ditherIntensity,
                dotSize,
                resampling,
                sharpenStrength,
                sharpenRadius,
                noise,
                denoise,
                blur,
                brightness,
                contrast,
                threshold,
                vibrance,
                posterize,
                tonalMappingType,
                highlightColor,
                midtoneColor,
                shadowColor,
                backgroundColor,
                // Wavy line specific settings
                ridgeSpacing,
                waveAmplitude,
                wavyLineColorMode,
                // Halftone circles specific settings
                halftoneGridSpacing,
                halftoneMinDot,
                halftoneMaxDot,
                halftoneColorMode
            };

            const success = await renderDitheredResult(settings);
            
            if (success) {
                showAlert("✓ Dithering applied successfully!");
            } else {
                showAlert("Could not apply dithering. Please check that an image is open.");
            }
            
        } catch (error) {
            console.error("Error rendering dither:", error);
            showAlert(`Error: ${error.message || error}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        // Render Settings
        setInputDPI(72);
        setDitherIntensity(100);
        setDotSize(1);
        setResampling("preserve");
        setSelectedAlgorithm("floyd-steinberg");
        setColorDepth(3);

        // Effect Controls
        setSharpenStrength(0);
        setSharpenRadius(1);
        setNoise(0);
        setDenoise(0);
        setBlur(0);
        setBrightness(0);
        setContrast(0);
        setVibrance(0);
        setPosterize(256);

        // Tonal Controls
        setTonalMappingType("singleColor");
        setHighlightColor("#ffffff");
        setMidtoneColor("#808080");
        setShadowColor("#000000");

        // Background
        setBackgroundColor("#ffffff");
    };

    return (
        <div className="dither-panel">
            <div className="panel-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                gap: '16px'
            }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Specular</h1>
                
                {/* LAYER STATUS Indicator - Glass style */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isLayerValid ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: isLayerValid ? '#4CAF50' : '#f44336',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                }}
                className={layerWarningActive ? 'layer-status-warning' : ''}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isLayerValid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                        border: `2px solid ${isLayerValid ? '#4CAF50' : '#f44336'}`,
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}>
                        {isLayerValid ? '✓' : '✗'}
                    </div>
                    <span style={{ marginLeft: '10px', display: 'inline-block' }}>{selectedLayerName || 'No layer'}</span>
                </div>
            </div>

            <div className="scrollable-content">
                {/* PRESETS Section */}
                <div className="section">
                    <div className="control-row">
                        <label className="control-label">Load Preset</label>
                        <select 
                            className="control-select"
                            defaultValue="default"
                            onChange={(e) => applyPreset(e.target.value)}
                        >
                            <option value="default">Default</option>
                            <option value="classic">Classic Newspaper</option>
                            <option value="fingerprint">Fingerprint (Purple)</option>
                            <option value="fine">Fine Detail</option>
                            <option value="artistic">Artistic</option>
                            <option value="glitch">Extreme Glitch</option>
                            <option value="ocean">Ocean Blue</option>
                            <option value="sunset">Sunset</option>
                            <option value="forest">Forest Green</option>
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="vintage">Vintage Film</option>
                            <option value="noir">Film Noir</option>
                            <option value="rose">Rose Gold</option>
                            <option value="cosmic">Cosmic Purple</option>
                            <option value="mint">Mint Fresh</option>
                            <option value="fire">Fire Red</option>
                            <option value="lavender">Lavender Dream</option>
                            <option value="ink">Ink Bleed</option>
                            <option value="sand">Desert Sand</option>
                            <option value="steel">Steel Blue</option>
                            <option value="cherry">Cherry Blossom</option>
                            <option value="midnight">Midnight</option>
                            <option value="gold">Gold Foil</option>
                            <option value="indigo">Indigo Dye</option>
                            <option value="eclipse">Eclipse</option>
                            <option value="aqua">Aqua</option>
                            <option value="crimson">Crimson</option>
                            <option value="slate">Slate</option>
                            <option value="cream">Cream</option>
                            <option value="plum">Plum</option>
                            <option value="emerald">Emerald</option>
                            <option value="copper">Copper</option>
                            <option value="mauve">Mauve</option>
                            <option value="charcoal">Charcoal</option>
                            <option value="peach">Peach</option>
                            <option value="olive">Olive</option>
                            <option value="twilight">Twilight</option>
                            <option value="heatmap">Heatmap</option>
                        </select>
                    </div>
                </div>

                {/* RENDER SETTINGS Section */}
                <div className="section">
                    <div className="section-header">
                        <span className="section-icon">⚙️</span>
                        <span className="section-title">RENDER SETTINGS</span>
                    </div>
                
                    <div className="control-row">
                        <label className="control-label">Input DPI</label>
                        <span className="control-value">{inputDPI}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="1"
                            max="600"
                            value={inputDPI}
                            onChange={(e) => setInputDPI(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Dithering Intensity</label>
                        <span className="control-value">{ditherIntensity}%</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="0"
                            max="200"
                            value={ditherIntensity}
                            onChange={(e) => setDitherIntensity(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Resampling</label>
                        <select 
                            className="control-select"
                            value={resampling}
                            onChange={(e) => setResampling(e.target.value)}
                        >
                            <option value="preserve">Preserve Details</option>
                            <option value="smooth">Smooth</option>
                            <option value="sharp">Sharp</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <label className="control-label">Algorithm</label>
                        <select 
                            className="control-select"
                            value={selectedAlgorithm}
                            onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        >
                            <option value="floyd-steinberg">Floyd-Steinberg (Best)</option>
                            <option value="jarvis-judice-ninke">Jarvis-Judice-Ninke (Quality)</option>
                            <option value="stucki">Stucki (Highest)</option>
                            <option value="sierra">Sierra (Balanced)</option>
                            <option value="burkes">Burkes (Fast Quality)</option>
                            <option value="atkinson">Atkinson (Fast)</option>
                            <option value="ordered-2x2">Ordered 2x2 Bayer</option>
                            <option value="ordered-4x4">Ordered 4x4 Bayer</option>
                            <option value="ordered-8x8">Ordered 8x8 Bayer</option>
                            <option value="wavy-line">Wavy Line (Fingerprint Ridge)</option>
                            <option value="halftone-circles">Halftone Circles</option>
                            <option value="threshold">Threshold (B&W)</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <label className="control-label">Color Depth</label>
                        <span className="control-value">{colorDepth} bit</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="1"
                            max="8"
                            value={colorDepth}
                            onChange={(e) => setColorDepth(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Dot Size</label>
                        <span className="control-value">{dotSize}x</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="1"
                            max="10"
                            step="0.5"
                            value={dotSize}
                            onChange={(e) => setDotSize(Number(e.target.value))}
                        />
                    </div>

                    {/* Wavy Line specific controls */}
                    {selectedAlgorithm === "wavy-line" && (
                        <>
                            <div className="control-row">
                                <label className="control-label">Ridge Spacing</label>
                                <span className="control-value">{ridgeSpacing.toFixed(1)} px</span>
                                <input 
                                    type="range"
                                    className="control-slider"
                                    min="1"
                                    max="8"
                                    step="0.5"
                                    value={ridgeSpacing}
                                    onChange={(e) => setRidgeSpacing(Number(e.target.value))}
                                />
                            </div>

                            <div className="control-row">
                                <label className="control-label">Wave Amplitude</label>
                                <span className="control-value">{waveAmplitude.toFixed(2)}</span>
                                <input 
                                    type="range"
                                    className="control-slider"
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                    value={waveAmplitude}
                                    onChange={(e) => setWaveAmplitude(Number(e.target.value))}
                                />
                            </div>

                            <div className="control-row">
                                <label className="control-label">Color Mode</label>
                                <select 
                                    className="control-select"
                                    value={wavyLineColorMode}
                                    onChange={(e) => setWavyLineColorMode(e.target.value)}
                                >
                                    <option value="purple-blue">Purple to Cyan (Fingerprint)</option>
                                    <option value="bw">Black & White</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Halftone Circles specific controls */}
                    {selectedAlgorithm === "halftone-circles" && (
                        <>
                            <div className="control-row">
                                <label className="control-label">Grid Spacing</label>
                                <span className="control-value">{halftoneGridSpacing} px</span>
                                <input 
                                    type="range"
                                    className="control-slider"
                                    min="2"
                                    max="32"
                                    step="1"
                                    value={halftoneGridSpacing}
                                    onChange={(e) => setHalftoneGridSpacing(Number(e.target.value))}
                                />
                            </div>

                            <div className="control-row">
                                <label className="control-label">Min Dot Size</label>
                                <span className="control-value">{halftoneMinDot.toFixed(1)} px</span>
                                <input 
                                    type="range"
                                    className="control-slider"
                                    min="0.1"
                                    max="4"
                                    step="0.1"
                                    value={halftoneMinDot}
                                    onChange={(e) => setHalftoneMinDot(Number(e.target.value))}
                                />
                            </div>

                            <div className="control-row">
                                <label className="control-label">Max Dot Size</label>
                                <span className="control-value">{halftoneMaxDot.toFixed(1)} px</span>
                                <input 
                                    type="range"
                                    className="control-slider"
                                    min="2"
                                    max="20"
                                    step="0.5"
                                    value={halftoneMaxDot}
                                    onChange={(e) => setHalftoneMaxDot(Number(e.target.value))}
                                />
                            </div>

                            <div className="control-row">
                                <label className="control-label">Dot Color Mode</label>
                                <select 
                                    className="control-select"
                                    value={halftoneColorMode}
                                    onChange={(e) => setHalftoneColorMode(e.target.value)}
                                >
                                    <option value="black-white">Black on White</option>
                                    <option value="inverted">White on Black</option>
                                    <option value="original">Original Colors</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* EFFECT CONTROLS Section */}
                <div className="section">
                    <div className="section-header">
                        <span className="section-icon">✏️</span>
                        <span className="section-title">EFFECT CONTROLS</span>
                    </div>

                    <div className="control-row">
                        <label className="control-label">Sharpen Strength</label>
                        <span className="control-value">{sharpenStrength}%</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="0"
                            max="100"
                            value={sharpenStrength}
                            onChange={(e) => setSharpenStrength(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Sharpen Radius</label>
                        <span className="control-value">{sharpenRadius}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="1"
                            max="50"
                            value={sharpenRadius}
                            onChange={(e) => setSharpenRadius(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Noise</label>
                        <span className="control-value">{noise}%</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="0"
                            max="100"
                            value={noise}
                            onChange={(e) => setNoise(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Denoise</label>
                        <span className="control-value">{denoise}%</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="0"
                            max="100"
                            value={denoise}
                            onChange={(e) => setDenoise(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Blur</label>
                        <span className="control-value">{blur}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="0"
                            max="50"
                            value={blur}
                            onChange={(e) => setBlur(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Brightness</label>
                        <span className="control-value">{brightness}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="-100"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Contrast</label>
                        <span className="control-value">{contrast}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="-100"
                            max="100"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Threshold</label>
                        <span className="control-value">{threshold}</span>
                        <input
                            type="range"
                            className="control-slider"
                            min="0"
                            max="255"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Vibrance</label>
                        <span className="control-value">{vibrance}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="-100"
                            max="100"
                            value={vibrance}
                            onChange={(e) => setVibrance(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-row">
                        <label className="control-label">Posterize (Color Levels)</label>
                        <span className="control-value">{posterize}</span>
                        <input 
                            type="range"
                            className="control-slider"
                            min="2"
                            max="256"
                            value={posterize}
                            onChange={(e) => setPosterize(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* TONAL CONTROLS Section */}
                <div className="section">
                    <div className="section-header">
                        <span className="section-icon">🎨</span>
                        <span className="section-title">TONAL CONTROLS</span>
                    </div>

                    <div className="control-row">
                        <label className="control-label">Color Mapping Mode</label>
                        <select 
                            className="control-select"
                            value={tonalMappingType}
                            onChange={(e) => setTonalMappingType(e.target.value)}
                        >
                            <option value="none">None (B&W)</option>
                            <option value="singleColor">Single Color</option>
                            <option value="3color">3-Color Duotone</option>
                            <option value="5color">5-Color Rich</option>
                            <option value="custom">Custom Palette</option>
                        </select>
                    </div>

                    {/* Single Color Mode */}
                    {tonalMappingType === "singleColor" && (
                        <ColorWheel 
                            label="Color"
                            value={highlightColor}
                            onChange={setHighlightColor}
                        />
                    )}

                    {/* 3-Color Mode */}
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
                        </>
                    )}

                    {/* 5-Color Mode */}
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
                        </>
                    )}

                    {/* Custom Mode */}
                    {tonalMappingType === "custom" && (
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
                        </>
                    )}
                </div>

                {/* BACKGROUND Section */}
                <div className="section">
                    <div className="section-header">
                        <span className="section-icon">🎯</span>
                        <span className="section-title">BACKGROUND</span>
                    </div>

                    <ColorWheel 
                        label="Background Color"
                        value={backgroundColor}
                        onChange={setBackgroundColor}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <sp-button-group>
                <sp-button 
                    variant="secondary"
                    onClick={handleReset}
                >
                    RESET
                </sp-button>
                <sp-button 
                    variant="primary" 
                    onClick={!isLayerValid || isProcessing ? undefined : handleRender}
                    title={!isLayerValid ? "No layer selected - please select a layer to render" : ""}
                    style={{
                        opacity: !isLayerValid ? 0.5 : 1,
                        cursor: !isLayerValid ? 'not-allowed' : 'pointer'
                    }}
                >
                    RENDER
                </sp-button>
            </sp-button-group>
        </div>
    );
};
