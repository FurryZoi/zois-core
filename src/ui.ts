import { Check, ChevronDown, CircleX, createElement, Trash2 } from "lucide";
import { getThemedColorsModule, SubscreenUnloadedEvent } from "./index";
import { StyleModule } from "./shard-modules";
import { MOD_DATA } from "./modsApi";
import { TabsShardContext, ButtonShardContext, ButtonShard, TextShardContext, TextShard, InputShardContext, InputShard, CheckboxShardContext, CheckboxShard, InputListShardContext, InputListShard, ImageShardContext, ImageShard, SvgShardContext, SvgShard, BackNextButtonShardContext, BackNextButtonShard, TabsShard, CardShardContext, CardShard, SelectShardContext, SelectShard, ContainerShardContext, ContainerShard } from "./shards";

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
}

export function hexToRgb(hex: string) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

export function dataUrlSvgWithColor(dataUrl: string, newColor: string): string {
    return dataUrl
        .replace(/fill="[^"]*"/g, `fill="${newColor}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${newColor}"`);
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

export function setSize(element: HTMLElement | SVGElement, width: number, height: number) {
    Object.assign(element.style, {
        width: getRelativeWidth(width) + 'px',
        height: getRelativeHeight(height) + 'px',
    });
}

export function setFontSize(element: HTMLElement, targetFontSize: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const fontSize = targetFontSize * scaleFactor;

    Object.assign(element.style, {
        fontSize: fontSize + 'px'
    });
}

export function setFontFamily(element: HTMLElement, fontFamily?: string) {
    element.style.fontFamily = fontFamily ?? "sans-serif";
}

export function setPadding(element: HTMLElement, targetPadding: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const paddingValue = targetPadding * scaleFactor;

    Object.assign(element.style, {
        padding: paddingValue + 'px',
    });
}

export function autosetFontSize(element: HTMLElement) {
    const Font = MainCanvas.canvas.clientWidth <= MainCanvas.canvas.clientHeight * 2 ? MainCanvas.canvas.clientWidth / 50 : MainCanvas.canvas.clientHeight / 25;

    Object.assign(element.style, {
        fontSize: Font + 'px'
    });
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

    return `base:${sortedStringify(styles.base)}|hover:${sortedStringify(styles.hover)}|active:${sortedStringify(styles.active)}|before:${sortedStringify(styles.before)}|after:${sortedStringify(styles.after)}`;
}

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

    if (styles.base) {
        cssRules += buildCssBlock(`.${className}`, styles.base);
    }

    if (styles.hover) {
        cssRules += buildCssBlock(`.${className}:hover`, styles.hover);
    }

    if (styles.active) {
        cssRules += buildCssBlock(`.${className}:active`, styles.active);
    }

    if (styles.focus) {
        cssRules += buildCssBlock(`.${className}:focus`, styles.focus);
    }

    if (styles.disabled) {
        cssRules += buildCssBlock(`.${className}:disabled`, styles.disabled);
    }

    if (styles.before) {
        cssRules += buildCssBlock(`.${className}:before`, styles.before);
    }

    if (styles.after) {
        cssRules += buildCssBlock(`.${className}:after`, styles.after);
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
    window.ZOISCORE.setSubscreenPrevious();
}


export function setSubscreen<T extends SubscreenConstructor>(
    subscreenConstructor: T | null,
    args: T extends new (...args: infer A) => any ? A : unknown[] = [] as any,
    callback?: (subscreen: BaseSubscreen) => void
): void {
    if (subscreenConstructor === null) return window.ZOISCORE.setSubscreen(null);
    if (typeof callback === "function") window.ZOISCORE.setSubscreen(`${MOD_DATA.key}:${subscreenConstructor.name}`, args ?? [], callback);
    else window.ZOISCORE.setSubscreen(`${MOD_DATA.key}:${subscreenConstructor.name}`, args ?? []);
}

export function getCurrentSubscreen(): BaseSubscreen | null {
    return window.ZOISCORE.getCurrentSubscreen();
}

export function getPreviousSubscreen(): BaseSubscreen | null {
    return window.ZOISCORE.getPreviousSubscreen();
}

export abstract class BaseSubscreen {
    private tabHandlers: Omit<TabsShardContext["tabs"][0], "name"> = {};
    protected readonly setSubscreen = setSubscreen;

    get currentSubscreen(): BaseSubscreen | null {
        return getCurrentSubscreen();
    }

    get previousSubscreen(): BaseSubscreen | null {
        return getPreviousSubscreen();
    }

    abstract get name(): string;

    run() {
        this.tabHandlers.run?.();
    }
    load() {
        this.createButton({
            x: 1815,
            y: 75,
            width: 90,
            height: 90,
            icon: "Icons/Exit.png",
            modules: {
                base: [
                    new StyleModule({
                        zIndex: "10"
                    })
                ]
            }
        }).addEventListener("click", () => this.exit());
        if (this.name) {
            this.createText({
                text: this.name,
                x: 100,
                y: 60,
                fontSize: 8
            }).style.cssText += "max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0.1em;";
        }
        if (subscreenHooks[this.constructor.name]) {
            subscreenHooks[this.name].forEach((hook) => hook(this));
        }
    }
    unload() {
        this.tabHandlers.unload?.();
        window.dispatchEvent(new SubscreenUnloadedEvent());
        // this.htmlElements.forEach((e) => {
        //     e.remove();
        // });
        // this.resizeEventListeners.forEach((e) => {
        //     removeEventListener("resize", e);
        // });
    }
    click() { }
    exit() {
        this.tabHandlers.exit?.();
        window.ZOISCORE.setSubscreenPrevious();
    }
    update() { }
    setPreviousSubscreen() {
        setPreviousSubscreen();
    }

    createButton(ctx: ButtonShardContext): HTMLButtonElement {
        const shard = new ButtonShard(ctx);
        const htmlElement = shard.mount() as HTMLButtonElement;

        return htmlElement;
    }

    createText(ctx: TextShardContext): HTMLParagraphElement {
        const shard = new TextShard(ctx);
        const htmlElement = shard.mount() as HTMLParagraphElement;
        return htmlElement;
    }

    createInput(ctx: InputShardContext): HTMLInputElement | HTMLTextAreaElement {
        const shard = new InputShard(ctx);
        const htmlElement = shard.mount() as HTMLInputElement | HTMLTextAreaElement;
        return htmlElement;
    }

    createCheckbox(ctx: CheckboxShardContext): HTMLInputElement {
        const shard = new CheckboxShard(ctx);
        const htmlElement = shard.mount() as HTMLInputElement;
        return htmlElement;
    }

    createInputList(ctx: InputListShardContext): HTMLDivElement {
        const shard = new InputListShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    createImage(ctx: ImageShardContext): HTMLImageElement {
        const shard = new ImageShard(ctx);
        const htmlElement = shard.mount() as HTMLImageElement;
        return htmlElement;
    }

    createSvg(ctx: SvgShardContext): SVGElement {
        const shard = new SvgShard(ctx);
        const htmlElement = shard.mount() as SVGElement;
        return htmlElement;
    }

    createBackNextButton(ctx: BackNextButtonShardContext): HTMLDivElement {
        const shard = new BackNextButtonShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    createTabs(ctx: TabsShardContext): HTMLDivElement {
        const shard = new TabsShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    drawPolylineArrow({
        points, strokeColor = getThemedColorsModule()?.base?.text ?? "black", lineWidth = 2,
        circleRadius = 5, circleColor = getThemedColorsModule()?.base?.text ?? "black"
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

    createCard(ctx: CardShardContext): HTMLDivElement {
        const shard = new CardShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    createSelect(ctx: SelectShardContext): HTMLDivElement {
        const shard = new SelectShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    createContainer(ctx: ContainerShardContext): HTMLDivElement {
        const shard = new ContainerShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }
}

const subscreenHooks: Record<string, ((subscreen: BaseSubscreen) => void)[]> = {};

export function hookSubscreen(subscreenName: string, hook: (subscreen: BaseSubscreen) => void) {
    if (!subscreenHooks[subscreenName]) subscreenHooks[subscreenName] = [];
    subscreenHooks[subscreenName].push(hook);
}