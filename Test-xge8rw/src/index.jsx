import React from "react";

import "./styles.css";
import { PanelController } from "./controllers/PanelController.jsx";
import { DitherPanel } from "./panels/DitherPanel.jsx";

import { entrypoints } from "uxp";

const ditherController =  new PanelController(() => <DitherPanel/>, {id: "ditherPanel", menuItems: [
    { id: "reload", label: "Reload Plugin", enabled: true, checked: false, oninvoke: () => location.reload() },
] });

entrypoints.setup({
    plugin: {
        create(plugin) {
            console.log("Specular Plugin created");
        },
        destroy() {
            console.log("Specular Plugin destroyed");
        }
    },
    panels: {
        ditherPanel: ditherController
    }
});
