import { logger } from "./logging";

function setSizeUnitVariable() {
    const { clientWidth, clientHeight } = MainCanvas.canvas;
    document.documentElement.style.setProperty("--size-unit", (Math.min(clientWidth, clientHeight) / 100).toString());
}

function setWidthUnitVariable() {
    document.documentElement.style.setProperty("--width-unit", (MainCanvas.canvas.clientWidth / 2000).toString());
}

function setHeightUnitVariable() {
    document.documentElement.style.setProperty("--height-unit", (MainCanvas.canvas.clientHeight / 1000).toString());
}

function setCanvasLeftVariable() {
    document.documentElement.style.setProperty("--canvas-left", MainCanvas.canvas.offsetLeft + "px");
}

function setCanvasTopVariable() {
    document.documentElement.style.setProperty("--canvas-top", MainCanvas.canvas.offsetTop + "px");
}

function setCanvasRightVariable() {
    const { offsetLeft, clientWidth } = MainCanvas.canvas;
    document.documentElement.style.setProperty("--canvas-right", (window.innerWidth - (offsetLeft + clientWidth)) + "px");
}

function setCanvasBottomVariable() {
    const { offsetTop, clientHeight } = MainCanvas.canvas;
    document.documentElement.style.setProperty("--canvas-bottom", (window.innerHeight - (offsetTop + clientHeight)) + "px");
}

function updateCssVars() {
    setSizeUnitVariable();
    setWidthUnitVariable();
    setHeightUnitVariable();
    setCanvasLeftVariable();
    setCanvasTopVariable();
    setCanvasRightVariable();
    setCanvasBottomVariable();
}

export function initCssVars() {
    try {
        updateCssVars();
        window.addEventListener("resize", updateCssVars);
        logger.log("Initialized css variables of zois-core shared environment");
    } catch (e) {
        logger.error("Failed to initialize css variables of zois-core shared environment", e);
    }
}