import { StyleModule } from "./shard-modules";
import { MOD_DATA } from "./index";
import {
    TabsShardContext, ButtonShardContext, ButtonShard, TextShardContext, TextShard, InputShardContext,
    InputShard, CheckboxShardContext, CheckboxShard, InputListShardContext, InputListShard, ImageShardContext,
    ImageShard, SvgShardContext, SvgShard, BackNextButtonShardContext, BackNextButtonShard, TabsShard, CardShardContext,
    CardShard, SelectShardContext, SelectShard, ContainerShardContext, ContainerShard, Shard,
    ExtensionsStorageBarShardContext, ExtensionsStorageBarShard
} from "./shards";
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

/**
 * Returns a CSS height scaled to the main canvas (base space: 2000x1000).
 * Based on `--height-unit`, so it updates automatically on resize.
 * @param height - Height in base units.
 */
export function getRelativeHeight(height: number) {
    return `calc(${height} * var(--height-unit) * 1px)`;
}

/**
 * Returns a CSS width scaled to the main canvas (base space: 2000x1000).
 * Based on `--width-unit`, so it updates automatically on resize.
 * @param width - Width in base units.
 */
export function getRelativeWidth(width: number) {
    return `calc(${width} * var(--width-unit) * 1px)`;
}

/**
 * Returns a CSS vertical offset from the top or bottom edge of the main canvas.
 * Based on `--canvas-*` and `--height-unit`, so it updates automatically on resize.
 * @param yPos - Offset in base units.
 * @param anchor - Canvas edge to measure from. Defaults to `"top"`.
 */
export function getRelativeY(yPos: number, anchor: "top" | "bottom" = "top") {
    return `calc(var(--canvas-${anchor}) + ${yPos} * var(--height-unit) * 1px)`;
}

/**
 * Returns a CSS horizontal offset from the left or right edge of the main canvas.
 * Based on `--canvas-*` and `--width-unit`, so it updates automatically on resize.
 * @param xPos - Offset in base units.
 * @param anchor - Canvas edge to measure from. Defaults to `"left"`.
 */
export function getRelativeX(xPos: number, anchor: "left" | "right" = "left") {
    return `calc(var(--canvas-${anchor}) + ${xPos} * var(--width-unit) * 1px)`;
}

/**
 * Fixes the element to the main canvas at the given position (base space: 2000x1000).
 * Uses CSS variables, so the position updates automatically on resize.
 * @param element - The element to position.
 * @param xPos - Horizontal offset in base units from the left or right canvas edge.
 * @param yPos - Vertical offset in base units from the top or bottom canvas edge.
 * @param anchor - Canvas corner the offsets are measured from. Defaults to `"top-left"`.
 */
export function setPosition(element: HTMLElement, xPos: number, yPos: number, anchor: Anchor = "top-left") {
    const yAnchor = anchor === 'top-left' || anchor === 'top-right' ? 'top' : 'bottom';
    const xAnchor = anchor === 'top-left' || anchor === 'bottom-left' ? 'left' : 'right';

    Object.assign(element.style, {
        position: "fixed",
        [xAnchor]: getRelativeX(xPos, xAnchor),
        [yAnchor]: getRelativeY(yPos, yAnchor),
    });
}

/**
 * Sets the element's width and height scaled to the main canvas (base space: 2000x1000).
 * Uses CSS variables, so the size updates automatically on resize.
 * @param element - The element to resize.
 * @param width - Width in base units.
 * @param height - Height in base units.
 */
export function setSize(element: HTMLElement | SVGElement, width: number, height: number) {
    Object.assign(element.style, {
        width: getRelativeWidth(width),
        height: getRelativeHeight(height),
    });
}

/**
 * Sets the element's font size scaled to the main canvas.
 * One unit is 1% of the canvas's smaller side. Uses `--size-unit`, so it updates automatically on resize.
 * @param element - The element whose font size should be set.
 * @param targetFontSize - Font size in `--size-unit` units.
 */
export function setFontSize(element: HTMLElement, targetFontSize: number) {
    element.style.fontSize = `calc(${targetFontSize} * var(--size-unit) * 1px)`;
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
 * Sets the element's padding on all sides scaled to the main canvas.
 * One unit is 1% of the canvas's smaller side. Uses `--size-unit`, so it updates automatically on resize.
 * @param element - The element whose padding should be set.
 * @param targetPadding - Padding in `--size-unit` units.
 */
export function setPadding(element: HTMLElement, targetPadding: number) {
    element.style.padding = `calc(${targetPadding} * var(--size-unit) * 1px)`;
}

/**
 * Sets the element's font size to the default size for the current main canvas.
 * Uses `--width-unit` and `--height-unit`, so it updates automatically on resize.
 * @param element - The element whose font size should be set.
 */
export function autosetFontSize(element: HTMLElement) {
    element.style.fontSize = "calc(min(var(--width-unit), var(--height-unit)) * 40 * 1px)";
}

/**
 * Returns a CSS length scaled to the main canvas.
 * One unit is 1% of the canvas's smaller side. Based on `--size-unit`, so it updates automatically on resize.
 * @param value - Value in `--size-unit` units.
 * @returns A CSS length string, e.g. `calc(3 * var(--size-unit) * 1px)`.
 */
export function u(value: number) {
    return `calc(${value} * var(--size-unit) * 1px)`;
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
    const className = getDynamicClass(styles);
    targetElement.classList.add(className);
}

/**
* Generates CSS class.
*
* The function checks a cache of previously created classes using a key generated from the provided styles.
* If a class with the same styles already exists, it simply returns this class name.
* Otherwise, it generates a unique class name (`dynamic-...`) with the corresponding CSS rules
* (including pseudo-classes `:hover`, `:active`, `:focus`, `:disabled` and pseudo-elements `::before`, `::after`) and returns generated class name,
*
* @param styles - An object of type `DynamicClassStyles`. Can contain:
*   - `base` — base styles;
*   - keys `hover`, `active`, `focus`, `disabled`, `before`, `after` — styles for the corresponding pseudo-classes/pseudo-elements;
*   - any other keys — additional selectors in the form `.className{key}`.
* @returns `class name`
*/
export function getDynamicClass(styles: DynamicClassStyles): string {
    const cacheKey = generateDynamicClassCacheKey(styles);
    const _class = createdDynamicClasses.find((g) => g.key === cacheKey);
    if (_class) return _class.className;
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

    return className;
}

const injectedKeyframes = new Map<string, string>();

/**
 * Dynamically injects @keyframes rules, similar to getDynamicClass.
 * Returns the animation name to use in CSS.
 * Cached by content hash so identical keyframes are not re-injected.
 */
export function getDynamicKeyframes(
    name: string,
    frames: Record<string, Partial<CSSStyleDeclaration>>
): string {
    const sortedStringify = (obj: Partial<CSSStyleDeclaration>) =>
        JSON.stringify(
            Object.keys(obj)
                .sort()
                .reduce((acc, key) => {
                    acc[key] = (obj as Record<string, any>)[key];
                    return acc;
                }, {} as Record<string, any>)
        );

    let cacheKey = `${name}|`;
    for (const [pct, styles] of Object.entries(frames)) {
        cacheKey += `${pct}:=${sortedStringify(styles)}|`;
    }

    const existing = injectedKeyframes.get(cacheKey);
    if (existing) return existing;

    let animName: string;
    do {
        animName = `zc-kf-${name}-${Math.random().toString(36).substring(2, 8)}`;
    } while ([...injectedKeyframes.values()].includes(animName));

    injectedKeyframes.set(cacheKey, animName);

    const toKebab = (prop: string) =>
        prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();

    let css = `@keyframes ${animName} {`;
    for (const [pct, styles] of Object.entries(frames)) {
        css += `${pct} {`;
        for (const [property, value] of Object.entries(styles)) {
            css += `${toKebab(property)}: ${value};`;
        }
        css += "}";
    }
    css += "}";

    let styleEl = document.getElementById("zc-dynamic-keyframes");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "zc-dynamic-keyframes";
        document.head.appendChild(styleEl);
    }
    styleEl.textContent += css;

    return animName;
}

export function onClickOutside(element: HTMLElement, callback: (event: MouseEvent) => void) {
    const handler = (event: MouseEvent) => {
        if (element.contains(event.target as Node)) {
            return;
        }
        callback(event);
    };

    document.addEventListener("click", handler, true);

    return () => {
        document.removeEventListener("click", handler, true);
    };
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

    public abstract get name(): string;

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
     * Override {@link onLoad} to define html elements.
     */
    public load() {
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
     * Define html elements here.
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

    public createExtensionsStorageBarShard(ctx: ExtensionsStorageBarShardContext): HTMLDivElement {
        const shard = new ExtensionsStorageBarShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }
}