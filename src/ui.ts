import { StyleModule } from "./shard-modules";
import { MOD_DATA } from "./index";
import { TabsShardContext, ButtonShardContext, ButtonShard, TextShardContext, TextShard, InputShardContext, InputShard, CheckboxShardContext, CheckboxShard, InputListShardContext, InputListShard, ImageShardContext, ImageShard, SvgShardContext, SvgShard, BackNextButtonShardContext, BackNextButtonShard, TabsShard, CardShardContext, CardShard, SelectShardContext, SelectShard, ContainerShardContext, ContainerShard, Shard } from "./shards";
import { logger } from "./logging";
import exitIcon from "./assets/icons/exit.svg";
import { eventBus } from "./events";

export type Anchor = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type SubscreenConstructor = new (...args: any[]) => BaseSubscreen;

type ReturnType<T extends (...args: any[]) => any> =
    T extends (...args: infer Args) => infer Return
    ? { args: Args; return: Return }
    : never;

interface DrawPolylineArrowArgs {
    points: {
        x: number
        y: number
    }[]
    strokeColor?: string
    lineWidth?: number
    circleRadius?: number
    circleColor?: string
}

export interface DynamicClassStyles {
    base?: Partial<CSSStyleDeclaration>
    hover?: Partial<CSSStyleDeclaration>
    active?: Partial<CSSStyleDeclaration>
    focus?: Partial<CSSStyleDeclaration>
    disabled?: Partial<CSSStyleDeclaration>
    before?: Partial<CSSStyleDeclaration>
    after?: Partial<CSSStyleDeclaration>
    [key: string]: Partial<CSSStyleDeclaration> | undefined
}

export function hexToRgb(hex: string) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

export function recolorSVG(svgElement: SVGElement, { fill, stroke }: { fill: string, stroke: string }): SVGElement {
    const elements = svgElement.querySelectorAll('*');

    elements.forEach((element) => {
        if (element.getAttribute('fill') !== 'none') {
            element.setAttribute('fill', fill);
        }

        if (element.getAttribute('stroke') !== 'none') {
            element.setAttribute('stroke', stroke);
        }
    });

    if (svgElement.getAttribute('fill') !== 'none') {
        svgElement.setAttribute('fill', fill);
    }

    if (svgElement.getAttribute('stroke') !== 'none') {
        svgElement.setAttribute('stroke', stroke);
    }

    return svgElement;
}

export function dataUrlSvgWithColor(dataUrl: string, newColor: { fill?: string, stroke?: string }): string {
    if (newColor.fill?.startsWith("#")) newColor.fill = hexToRgb(newColor.fill);
    if (newColor.stroke?.startsWith("#")) newColor.stroke = hexToRgb(newColor.stroke);
    if (newColor.fill) dataUrl = dataUrl.replace(/fill="[^"]*"/g, `fill="${newColor.fill}"`);
    if (newColor.stroke) dataUrl = dataUrl.replace(/stroke="[^"]*"/g, `stroke="${newColor.stroke}"`);
    return dataUrl;
}

export function dataUrlSvgReplaceVars(dataUrl: string, vars: Record<string, string>): string {
    for (let [name, value] of Object.entries(vars)) {
        if (value.startsWith("#")) {
            value = hexToRgb(value);
        }
        dataUrl = dataUrl.replaceAll(`$${name}`, value);
    }
    return dataUrl;
}

/**
* Returns the value of a CSS variable if it exists, otherwise returns the provided fallback.
* @param name - The name of the CSS variable (e.g. `"--button-color"`).
* @param fallback - The fallback value to return if the CSS variable is not set or empty.
* @returns The resolved CSS variable value or the fallback.
*/
export function cssVar(name: string, fallback: string) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

export function getRelativeHeight(height: number) {
    return height * (MainCanvas.canvas.clientHeight / 1000);
}

export function getRelativeWidth(width: number) {
    return width * (MainCanvas.canvas.clientWidth / 2000);
}

export function getRelativeY(yPos: number, anchorPosition: 'top' | 'bottom' = 'top') {
    const scaleY = MainCanvas.canvas.clientHeight / 1000;
    return anchorPosition === 'top'
        ? MainCanvas.canvas.offsetTop + yPos * scaleY
        : window.innerHeight - (MainCanvas.canvas.offsetTop + MainCanvas.canvas.clientHeight) + yPos * scaleY;
}

export function getRelativeX(xPos: number, anchorPosition: 'left' | 'right' = 'left') {
    const scaleX = MainCanvas.canvas.clientWidth / 2000;
    return anchorPosition === 'left'
        ? MainCanvas.canvas.offsetLeft + xPos * scaleX
        : window.innerWidth - (MainCanvas.canvas.offsetLeft + MainCanvas.canvas.clientWidth) + xPos * scaleX;
}

/**
* Sets the position of the given HTML element relative to the specified anchor point.
* Position scaled relative to the current size of the main canvas.
* @param element - The HTML element to position.
* @param xPos - The base horizontal position value.
* @param yPos - The base vertical position value.
* @param anchor - The anchor point used for positioning. Defaults to `"top-left"`.
* @returns void
*/
export function setPosition(element: HTMLElement, xPos: number, yPos: number, anchor: Anchor = "top-left") {
    const yAnchor = anchor === 'top-left' || anchor === 'top-right' ? 'top' : 'bottom';
    const xAnchor = anchor === 'top-left' || anchor === 'bottom-left' ? 'left' : 'right';

    const y = getRelativeY(yPos, yAnchor);
    const x = getRelativeX(xPos, xAnchor);

    Object.assign(element.style, {
        position: 'fixed',
        [xAnchor]: x + 'px',
        [yAnchor]: y + 'px',
    });
}

/**
* Sets the width and height of the given element,
* scaled relative to the current size of the main canvas.
* @param element - The element whose size should be updated.
* @param width - The base width value.
* @param height - The base height value.
* @returns void
*/
export function setSize(element: HTMLElement | SVGElement, width: number, height: number) {
    Object.assign(element.style, {
        width: getRelativeWidth(width) + 'px',
        height: getRelativeHeight(height) + 'px',
    });
}

/**
* Sets the font size of the given HTML element based on a target font size value,
* scaled relative to the current size of the main canvas.
* @param element - The HTML element whose font size should be updated.
* @param targetFontSize - The base font size value to be scaled.
* @returns void
*/
export function setFontSize(element: HTMLElement, targetFontSize: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const fontSize = targetFontSize * scaleFactor;

    Object.assign(element.style, {
        fontSize: fontSize + 'px'
    });
}

/**
* Sets the font family of the given HTML element.
* @param element - The HTML element whose font family should be updated.
* @param fontFamily - Optional font family name. Defaults to `"sans-serif"`.
* @returns void
*/
export function setFontFamily(element: HTMLElement, fontFamily?: string) {
    element.style.fontFamily = fontFamily ?? "sans-serif";
}

/**
* Sets the padding of the given HTML element based on a target padding value,
* scaled relative to the current size of the main canvas.
* @param element - The HTML element whose padding should be updated.
* @param targetPadding - The base padding value to be scaled.
* @returns void
*/
export function setPadding(element: HTMLElement, targetPadding: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const paddingValue = targetPadding * scaleFactor;

    Object.assign(element.style, {
        padding: paddingValue + 'px',
    });
}

/**
* Automatically sets the font size of the given HTML element based on the current size of the main canvas.
* @param element - The HTML element whose font size should be updated.
* @returns void
*/
export function autosetFontSize(element: HTMLElement) {
    const Font = MainCanvas.canvas.clientWidth <= MainCanvas.canvas.clientHeight * 2 ? MainCanvas.canvas.clientWidth / 50 : MainCanvas.canvas.clientHeight / 25;

    Object.assign(element.style, {
        fontSize: Font + 'px'
    });
}

export function setSizeUnitVariable() {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;
    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;
    document.documentElement.style.setProperty('--size-unit', scaleFactor.toString());
}

const createdDynamicClasses: {
    key: string
    className: string
}[] = [];

function generateDynamicClassCacheKey(styles: DynamicClassStyles) {
    const sortedStringify = (obj: Partial<CSSStyleDeclaration> | undefined) => {
        if (!obj) return "null";
        return JSON.stringify(
            Object.keys(obj).sort().reduce((acc, key) => {
                acc[key] = (obj as Record<string, any>)[key];
                return acc;
            }, {} as Record<string, any>)
        );
    };

    let cacheKey = "";
    for (const [key, value] of Object.entries(styles)) {
        if (value === undefined) continue;
        cacheKey += `${key}:=${sortedStringify(value)}|`;
    }
    return cacheKey;
}

/**
* Adds a dynamically generated CSS class to the specified element.
*
* The function checks a cache of previously created classes using a key generated from the provided styles.
* If a class with the same styles already exists, it simply adds that class name to the element.
* Otherwise, it generates a unique class name (`dynamic-...`) with the corresponding CSS rules
* (including pseudo-classes `:hover`, `:active`, `:focus`, `:disabled` and pseudo-elements `::before`, `::after`),
*
* @param targetElement - The element to which the dynamic class should be applied.
* @param styles - An object of type `DynamicClassStyles`. Can contain:
*   - `base` — base styles;
*   - keys `hover`, `active`, `focus`, `disabled`, `before`, `after` — styles for the corresponding pseudo-classes/pseudo-elements;
*   - any other keys — additional selectors in the form `.className{key}`.
* @returns `void`
*/
export function addDynamicClass(targetElement: HTMLElement | SVGElement, styles: DynamicClassStyles): void {
    const cacheKey = generateDynamicClassCacheKey(styles);
    const _class = createdDynamicClasses.find((g) => g.key === cacheKey);
    if (_class) return targetElement.classList.add(_class.className);
    let className: string;
    do {
        className = "dynamic-" + Math.random().toString(36).substring(2, 10);
    } while (createdDynamicClasses.find((g) => g.className === className));

    createdDynamicClasses.push({
        key: cacheKey,
        className
    });

    const buildCssBlock = (selector: string, styleRules: Partial<CSSStyleDeclaration>): string => {
        let css = `${selector} {`;
        for (const [property, value] of Object.entries(styleRules)) {
            css += `${property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}: ${value};`;
        }
        css += '}';
        return css;
    };

    let cssRules = "";

    for (const [key, value] of Object.entries(styles)) {
        if (value === undefined) continue;
        if (key === "base") {
            cssRules += buildCssBlock(`.${className}`, value);
        } else if (["hover", "active", "focus", "disabled", "before", "after"].includes(key)) {
            cssRules += buildCssBlock(`.${className}:${key}`, value);
        } else {
            cssRules += buildCssBlock(`.${className}${key}`, value);
        }
    }

    let styleElement = document.getElementById(`${MOD_DATA.key ?? ""}-dynamic-classes`);
    if (styleElement) {
        styleElement.textContent += cssRules;
    } else {
        styleElement = document.createElement('style');
        styleElement.id = `${MOD_DATA.key ?? ""}-dynamic-classes`;
        styleElement.textContent = cssRules;
        document.head.appendChild(styleElement);
    }

    targetElement.classList.add(className);
}

export function setPreviousSubscreen(): void {
    setSubscreen(previousSubscreen);
}

let previousSubscreen: BaseSubscreen | null = null;
let currentSubscreen: BaseSubscreen | null = null;

export function setSubscreen(subscreen: BaseSubscreen | null): void {
    previousSubscreen = currentSubscreen;
    currentSubscreen = subscreen;
    if (previousSubscreen) {
        try {
            previousSubscreen.unload();
        } catch (e) {
            logger.error("Failed to unload subscreen", previousSubscreen, e);
        }
    }
    if (subscreen) {
        try {
            subscreen.load();
        } catch (e) {
            logger.error("Failed to load subscreen", subscreen, e);
        }
    }
}

export function getCurrentSubscreen(): BaseSubscreen | null {
    return currentSubscreen;
}

export function getPreviousSubscreen(): BaseSubscreen | null {
    return previousSubscreen;
}

/**
 * Abstract class to define subscreens with lifecycle management, UI element creation and navigation functionality.
 */
export abstract class BaseSubscreen {
    protected readonly setSubscreen = setSubscreen;
    protected readonly setPreviousSubscreen = setPreviousSubscreen;

    protected get currentSubscreen(): BaseSubscreen | null {
        return getCurrentSubscreen();
    }

    protected get previousSubscreen(): BaseSubscreen | null {
        return getPreviousSubscreen();
    }

    abstract get name(): string;

    /**
     * Called each frame.
     * 
     * You probably want to override {@link onRun}, **do not** override `run` if you don't understand what you're doing.
     */
    public run() {
        this.onRun?.();
    }
    /**
     * Called each frame.
     */
    protected onRun?(): void

    /**
     * Called once after `setSubscreen()`.
     * Responsible for how the subscreen will load.
     * 
     * You probably want to override {@link onLoad}, **do not** override `load` if you don't understand what you're doing.
     * 
     * Override {@link onLoad} for creating UI elements.
     */
    public load() {
        setSizeUnitVariable();
        this.createExitButton();
        if (this.name) this.createSubscreenTitle();
        this.onLoad?.();
        eventBus?.emit("subscreenLoaded", {
            subscreen: this
        });
    }
    /**
     * Called once after `setSubscreen()`.
     * 
     * Create UI elements here.
     */
    protected onLoad?(): void

    /**
     * Called once when subscreen is being unloaded.
     * 
     * You probably want to override {@link onUnload}, **do not** override `unload` if you don't understand what you're doing.
     */
    public unload() {
        this.onUnload?.();
        eventBus?.emit("subscreenUnloaded", {
            subscreen: this
        });
    }

    /**
     * Called once when subscreen is being unloaded.
     */
    protected onUnload?(): void

    /**
     * Called after user clicks.
     * 
     * You probably want to override {@link onClick}, **do not** override `click` if you don't understand what you're doing.
     */
    public click() {
        this.onClick?.();
    }

    /**
     * Called after user clicks.
     */
    protected onClick?(): void

    /**
     * Called after user presses `Esc` or clicks on exit button.
     * 
     * Not called after subscreen unloading with `setSubscreen()`
     * 
     * You probably want to override {@link onExit}, **do not** override `exit` if you don't understand what you're doing.
     */
    public exit() {
        this.onExit?.();
        setPreviousSubscreen();
    }

    /**
     * Called after user presses `Esc` or clicks on exit button.
     * 
     * Not called after subscreen unloading with `setSubscreen()`
     */
    protected onExit?(): void

    public update() { }

    /**
     * Called after screen size change.
     * 
     * You probably want to override {@link onResize}, **do not** override `resize` if you don't understand what you're doing.
     */
    public resize() {
        setSizeUnitVariable();
        this.onResize?.();
    }

    /**
     * Called after screen size change.
     */
    protected onResize?(): void

    public createExitButton() {
        this.createButton({
            x: 1815,
            y: 75,
            width: 90,
            height: 90,
            icon: dataUrlSvgWithColor(exitIcon, { fill: cssVar("--tmd-text", "black") }),
            tooltip: {
                position: "left",
                text: "Back"
            },
            modules: {
                base: [
                    new StyleModule({
                        zIndex: "10"
                    })
                ]
            },
            onClick: () => this.exit()
        });
    }

    public createSubscreenTitle() {
        this.createText({
            text: this.name,
            x: 100,
            y: 60,
            fontSize: 8
        }).style.cssText += "max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0.1em;";
    }

    public create(shard: Shard) {
        const htmlElement = shard.mount() as HTMLElement;
        return htmlElement;
    }

    public createButton(ctx: ButtonShardContext): HTMLButtonElement {
        const shard = new ButtonShard(ctx);
        const htmlElement = shard.mount() as HTMLButtonElement;

        return htmlElement;
    }

    public createText(ctx: TextShardContext): HTMLParagraphElement {
        const shard = new TextShard(ctx);
        const htmlElement = shard.mount() as HTMLParagraphElement;
        return htmlElement;
    }

    public createInput(ctx: InputShardContext): HTMLInputElement | HTMLTextAreaElement {
        const shard = new InputShard(ctx);
        const htmlElement = shard.mount() as HTMLInputElement | HTMLTextAreaElement;
        return htmlElement;
    }

    public createCheckbox(ctx: CheckboxShardContext): HTMLDivElement {
        const shard = new CheckboxShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public createInputList<NumbersOnly extends boolean>(ctx: InputListShardContext<NumbersOnly>): HTMLDivElement {
        const shard = new InputListShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public createImage(ctx: ImageShardContext): HTMLImageElement {
        const shard = new ImageShard(ctx);
        const htmlElement = shard.mount() as HTMLImageElement;
        return htmlElement;
    }

    public createSvg(ctx: SvgShardContext): SVGElement {
        const shard = new SvgShard(ctx);
        const htmlElement = shard.mount() as SVGElement;
        return htmlElement;
    }

    public createBackNextButton(ctx: BackNextButtonShardContext): HTMLDivElement {
        const shard = new BackNextButtonShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public createTabs(ctx: TabsShardContext): HTMLDivElement {
        const shard = new TabsShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public drawPolylineArrow({
        points, strokeColor = cssVar("--tmd-text", "black"), lineWidth = 2,
        circleRadius = 5, circleColor = cssVar("--tmd-text", "black")
    }: DrawPolylineArrowArgs): void {
        if (points.length < 2) return;

        const ctx = MainCanvas.canvas.getContext("2d");
        if (!ctx) return;
        ctx.save();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = circleColor;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(points[points.length - 1].x, points[points.length - 1].y, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    public createCard(ctx: CardShardContext): HTMLDivElement {
        const shard = new CardShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public createSelect(ctx: SelectShardContext): HTMLDivElement {
        const shard = new SelectShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    public createContainer(ctx: ContainerShardContext): HTMLDivElement {
        const shard = new ContainerShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }
}