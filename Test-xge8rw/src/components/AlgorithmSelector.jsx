import React from "react";

export const AlgorithmSelector = ({ selected, onChange }) => {
    const algorithms = [
        { id: "floyd-steinberg", label: "Floyd-Steinberg" },
        { id: "ordered", label: "Ordered Dithering" },
        { id: "threshold", label: "Threshold" },
        { id: "wavy-line", label: "Wavy Line (Fingerprint)" },
        { id: "halftone-circles", label: "Halftone Circles" },
        { id: "adaptive", label: "Adaptive (Coming Soon)" },
    ];

    return (
        <div className="algorithm-selector">
            {algorithms.map(algo => (
                <label key={algo.id} className="radio-option">
                    <input 
                        type="radio" 
                        name="algorithm" 
                        value={algo.id}
                        checked={selected === algo.id}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={algo.id === "adaptive"}
                    />
                    <span>{algo.label}</span>
                </label>
            ))}
        </div>
    );
};
