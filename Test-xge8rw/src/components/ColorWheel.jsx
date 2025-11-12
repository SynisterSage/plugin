import React, { useState, useRef, useEffect } from "react";
import "../styles/ColorWheel.css";

/**
 * ColorWheel Component - Interactive HSV Color Picker
 * Like Photoshop's color picker tool
 * 
 * Props:
 * - label: string - Label for the color selector
 * - value: string - Current hex color value (e.g., "#FF0000")
 * - onChange: function - Callback when color changes
 */
export const ColorWheel = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hsv, setHsv] = useState(() => hexToHsv(value));

    const handleBrightnessChange = (e) => {
        const brightness = parseInt(e.target.value);
        const newHsv = { h: hsv.h, s: hsv.s, v: brightness };
        setHsv(newHsv);
        updateColor(newHsv);
    };

    const handleSaturationChange = (e) => {
        const saturation = parseInt(e.target.value);
        const newHsv = { h: hsv.h, s: saturation, v: hsv.v };
        setHsv(newHsv);
        updateColor(newHsv);
    };

    const handleHueChange = (e) => {
        const hue = parseInt(e.target.value);
        const newHsv = { h: hue, s: hsv.s, v: hsv.v };
        setHsv(newHsv);
        updateColor(newHsv);
    };

    const updateColor = (newHsv) => {
        const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        onChange(hex);
    };

    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    return (
        <div className="color-wheel-container">
            <div className="color-wheel-label-row">
                <label className="color-wheel-label">{label}</label>
            </div>

            <div className="color-wheel-preview-section">
                <div 
                    className="color-preview-square" 
                    style={{ 
                        backgroundColor: hex,
                        width: '50px',
                        height: '50px',
                        display: 'block'
                    }} 
                />
                <div className="color-info">
                    <div className="color-hex-display">{hex.toUpperCase()}</div>
                    <div className="color-rgb-display">RGB({rgb.r}, {rgb.g}, {rgb.b})</div>
                </div>
            </div>

            <button
                className="color-wheel-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "▼ Hide" : "▶ Show"} Color Picker
            </button>

            {isOpen && (
                <div className="color-wheel-picker">
                    {/* Control Sliders */}
                    <div className="color-wheel-sliders">
                        <div className="slider-group">
                            <label className="slider-label">Hue</label>
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={hsv.h}
                                    onChange={handleHueChange}
                                    className="color-slider hue-slider"
                                    style={{
                                        background: `linear-gradient(to right, 
                                            hsl(0, 100%, 50%), 
                                            hsl(60, 100%, 50%), 
                                            hsl(120, 100%, 50%), 
                                            hsl(180, 100%, 50%), 
                                            hsl(240, 100%, 50%), 
                                            hsl(300, 100%, 50%), 
                                            hsl(360, 100%, 50%))`
                                    }}
                                />
                                <span className="slider-value">{Math.round(hsv.h)}°</span>
                            </div>
                        </div>

                        <div className="slider-group">
                            <label className="slider-label">Saturation</label>
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={hsv.s}
                                    onChange={handleSaturationChange}
                                    className="color-slider saturation-slider"
                                    style={{
                                        background: `linear-gradient(to right, ${rgbToHex(
                                            hsvToRgb(hsv.h, 0, hsv.v).r,
                                            hsvToRgb(hsv.h, 0, hsv.v).g,
                                            hsvToRgb(hsv.h, 0, hsv.v).b
                                        )}, ${rgbToHex(
                                            hsvToRgb(hsv.h, 100, hsv.v).r,
                                            hsvToRgb(hsv.h, 100, hsv.v).g,
                                            hsvToRgb(hsv.h, 100, hsv.v).b
                                        )})`
                                    }}
                                />
                                <span className="slider-value">{Math.round(hsv.s)}%</span>
                            </div>
                        </div>

                        <div className="slider-group">
                            <label className="slider-label">Value (Brightness)</label>
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={hsv.v}
                                    onChange={handleBrightnessChange}
                                    className="color-slider brightness-slider"
                                    style={{
                                        background: `linear-gradient(to right, #000000, ${rgbToHex(
                                            hsvToRgb(hsv.h, hsv.s, 100).r,
                                            hsvToRgb(hsv.h, hsv.s, 100).g,
                                            hsvToRgb(hsv.h, hsv.s, 100).b
                                        )})`
                                    }}
                                />
                                <span className="slider-value">{Math.round(hsv.v)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Convert HSV (Hue, Saturation, Value) to RGB
 */
function hsvToRgb(h, s, v) {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b;

    if (h < 60) {
        r = c; g = x; b = 0;
    } else if (h < 120) {
        r = x; g = c; b = 0;
    } else if (h < 180) {
        r = 0; g = c; b = x;
    } else if (h < 240) {
        r = 0; g = x; b = c;
    } else if (h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            h = ((b - r) / diff + 2) / 6;
        } else {
            h = ((r - g) / diff + 4) / 6;
        }
    }

    return {
        h: h * 360,
        s: s * 100,
        v: v * 100,
    };
}

/**
 * Convert hex color to HSV
 */
function hexToHsv(hex) {
    if (!hex || typeof hex !== 'string') {
        return { h: 0, s: 0, v: 100 };
    }
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    return rgbToHsv(r, g, b);
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
            .toUpperCase()
    );
}
