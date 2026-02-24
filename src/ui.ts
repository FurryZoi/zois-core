import { Check, ChevronDown, CircleX, createElement, Trash2 } from "lucide";
import { getThemedColorsModule, MOD_DATA } from "./index";
import { BaseModule, Context } from "./modules";
import { StyleModule } from "./ui-modules";

export type Anchor = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface BaseElementArgs<T extends string> {
    x?: number
    y?: number
    anchor?: Anchor
    place?: boolean
    modules?: Partial<Record<T, BaseModule[]>>
}

interface CreateButtonArgs extends BaseElementArgs<"base" | "icon" | "text"> {
    text?: string
    fontSize?: number | "auto"
    width?: number
    height?: number
    padding?: number
    style?: "default" | "green" | "inverted"
    icon?: string | SVGElement
    iconAbsolutePosition?: boolean
    tooltip?: {
        text: string
        position: "left" | "right"
    }
    onClick?: () => void
    isDisabled?: () => boolean
}

interface CreateTextArgs extends BaseElementArgs<"base"> {
    text?: string
    color?: string
    fontSize?: number | "auto"
    withBackground?: boolean
    withBorder?: boolean
    width?: number
    height?: number
    padding?: number
}

interface CreateInputArgs extends BaseElementArgs<"base"> {
    value?: string
    placeholder?: string
    width: number
    height?: number
    textArea?: boolean
    fontSize?: number | "auto"
    padding?: number
    onChange?: () => void
    onInput?: () => void
    isDisabled?: () => boolean
}

interface CreateCheckboxArgs extends BaseElementArgs<"base" | "checkbox" | "label"> {
    isChecked: boolean
    width?: number
    text: string
    onChange?: () => void
    isDisabled?: () => boolean
}

interface CreateScrollViewArgs extends BaseElementArgs<"base"> {
    scroll: "x" | "y" | "all"
    width: number,
    height?: number
}

interface CreateInputListArgs extends BaseElementArgs<"base" | "input"> {
    value?: string[] | number[]
    title?: string
    width: number
    height?: number
    fontSize?: number | "auto"
    padding?: number
    numbersOnly?: boolean
    onChange?: (value: string[] | number[]) => void
    isDisabled?: () => boolean
}

interface CreateImageArgs extends BaseElementArgs<"base"> {
    src: string
    width: number
}

interface CreateSvgArgs extends BaseElementArgs<"base"> {
    dataurl: string
    size: number
    fill?: string
    stroke?: string
    strokeWidth?: string
}

interface CreateBackNextButtonArgs extends BaseElementArgs<"base" | "backButton" | "nextButton" | "text"> {
    width: number
    height: number
    items: [string, any?][]
    currentIndex: number
    isBold?: boolean
    onChange?: (value: any) => void
    isDisabled?: (value: any) => boolean
}

interface CreateTabArgs extends BaseElementArgs<"base"> {
    width: number
    tabs: {
        name: string
        load?: () => void
        unload?: () => void
        run?: () => void
        exit?: () => void
    }[]
    currentTabName: string
}

interface CreateCardArgs extends BaseElementArgs<"base" | "name" | "value" | "icon"> {
    name: string
    value: string | number
    icon?: SVGElement
}

interface CreateSelectArgs extends BaseElementArgs<"base"> {
    width: number
    options: {
        name: any
        text: string
        icon?: SVGElement
    }[]
    currentOption: string
    onChange?: (name: any) => void
    isDisabled?: () => boolean
}

interface CreateContainerArgs extends BaseElementArgs<"base"> {
    width?: number
    height?: number
}

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

export function dataUrlSvgWithColor(dataUrl: string, newColor: string): string {
    return dataUrl
        .replace(/fill="[^"]*"/g, `fill="${newColor}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${newColor}"`);
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

export function setSize(element: HTMLElement, width: number, height: number) {
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
    const sortedStringify = (obj: Partial<CSSStyleDeclaration>) => {
        if (!obj) return "null";
        return JSON.stringify(
            Object.keys(obj).sort().reduce((acc, key) => {
                acc[key] = obj[key];
                return acc;
            }, {})
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
    setSubscreen(previousSubscreen);
}

export function setSubscreen(subscreen: BaseSubscreen | null): void {
    previousSubscreen = currentSubscreen;
    currentSubscreen = subscreen;
    if (currentSubscreen) currentSubscreen.load();
    if (previousSubscreen) previousSubscreen.unload();
}

export function getCurrentSubscreen(): BaseSubscreen {
    return currentSubscreen;
}

let currentSubscreen: BaseSubscreen | null;
let previousSubscreen: BaseSubscreen | null = null;


export abstract class BaseSubscreen {
    private htmlElements: HTMLElement[] = [];
    private resizeEventListeners: EventListener[] = [];
    private tabHandlers: Omit<CreateTabArgs["tabs"][0], "name"> = {};

    private addElement<T extends string>(element: HTMLElement, {
        x, y, width, height, padding, fontSize = "auto", anchor, place, modules = {}, modulesMap
    }: {
        x?: number
        y?: number
        width?: number
        height?: number
        padding?: number
        fontSize?: number | "auto"
        anchor?: Anchor
        place?: boolean
        modules?: Record<string, BaseModule[]>
        modulesMap: Record<T, HTMLElement | SVGElement>
    }) {
        setFontFamily(element, MOD_DATA.fontFamily);

        const context: Context = {
            anchor, x, y, width, height,
            padding, fontSize, place, element
        };

        Object.keys(modules)?.forEach((k) => {
            modules[k].forEach((m: BaseModule) => {
                const props = m.overrideProperties(context, modulesMap[k]);
                anchor = props.anchor;
                x = props.x;
                y = props.y;
                width = props.width;
                height = props.height;
                padding = props.padding;
                fontSize = props.fontSize;
                place = props.place;
                element = props.element;
            });
        });

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(element, x, y, anchor);
            if (fontSize === "auto") autosetFontSize(element);
            else setFontSize(element, fontSize);
            if (padding) setPadding(element, padding);
            if (width) element.style.width = getRelativeWidth(width) + "px";
            if (height) element.style.height = getRelativeHeight(height) + "px";
        }

        setProperties();
        window.addEventListener("resize", setProperties);

        Object.keys(modules)?.forEach((k) => {
            modules[k].forEach((m: BaseModule) => {
                m.layoutEffect(context, modulesMap[k]);
            });
        });

        if (place) document.body.append(element);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(element);

        Object.keys(modules)?.forEach((k) => {
            modules[k].forEach((m: BaseModule) => {
                m.effect(context, modulesMap[k]);
            });
        });
    }

    get currentSubscreen(): BaseSubscreen | null {
        return currentSubscreen;
    }

    get previousSubscreen(): BaseSubscreen | null {
        return previousSubscreen;
    }

    get name(): string {
        return "";
    }

    run?() {
        this.tabHandlers.run?.();
    }
    load?() {
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
    unload?() {
        this.tabHandlers.unload?.();
        this.htmlElements.forEach((e) => {
            e.remove();
        });
        this.resizeEventListeners.forEach((e) => {
            removeEventListener("resize", e);
        });
    }
    click?() { }
    exit?() {
        this.tabHandlers.exit?.();
        this.setSubscreen(this.previousSubscreen);
    }
    update?() { }
    setPreviousSubscreen() {
        setPreviousSubscreen();
    }
    setSubscreen(subscreen: BaseSubscreen | null) {
        setSubscreen(subscreen);
    }

    createButton({
        text, x, y, width, height, fontSize = "auto",
        anchor = "top-left", padding, style = "default",
        place = true, icon, iconAbsolutePosition = true,
        tooltip, onClick, isDisabled, modules
    }: CreateButtonArgs): HTMLButtonElement {
        let iconElement: HTMLImageElement | SVGElement;
        let textElement: HTMLSpanElement;
        const btn = document.createElement("button");
        btn.classList.add("zcButton");
        btn.setAttribute("data-zc-style", style);
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.columnGap = "1.25vw";
        setFontFamily(btn, MOD_DATA.fontFamily);

        if (icon) {
            if (typeof icon === "string") {
                iconElement = document.createElement("img");
                iconElement.src = icon;
            } else {
                iconElement = icon;
            }
            iconElement.style.height = "80%";
            iconElement.style.width = "auto";
            if (text && iconAbsolutePosition) {
                iconElement.style.position = "absolute";
                iconElement.style.left = "1vw";
            }
            if (text && !iconAbsolutePosition) btn.style.justifyContent = "";
            btn.append(iconElement);
        }

        if (text) {
            textElement = document.createElement("span");
            textElement.textContent = text;
            // if (icon && !iconAbsolutePosition) {
            //     textElement.style.width = "100%";
            // }
            btn.append(textElement);
        }

        if (tooltip) {
            const tooltipEl = document.createElement("span");
            tooltipEl.classList.add("tooltip");
            tooltipEl.setAttribute("position", tooltip.position);
            tooltipEl.textContent = tooltip.text;
            btn.append(tooltipEl);
        }

        if (typeof isDisabled === "function" && isDisabled()) btn.classList.add("zcDisabled");
        btn.addEventListener("click", () => {
            if (typeof isDisabled === "function" && isDisabled()) return btn.classList.add("zcDisabled");
            if (typeof onClick === "function") onClick();
        });
        this.addElement<keyof CreateButtonArgs["modules"]>(btn, {
            x, y, width, height, anchor, place, fontSize, padding, modules, modulesMap: {
                base: btn,
                text: textElement,
                icon: iconElement
            }
        });
        return btn;
    }

    createText({
        text, color, x, y, width, height, withBackground = false,
        withBorder = false, fontSize = "auto", anchor = "top-left", padding,
        place = true, modules
    }: CreateTextArgs): HTMLParagraphElement {
        const p = document.createElement("p");
        p.innerHTML = text;
        p.style.color = color ?? "var(--tmd-text, black)";
        if (withBackground) p.style.background = "var(--tmd-element,rgb(239, 239, 239))";
        if (withBorder) p.style.border = "2px solid var(--tmd-accent, rgb(236, 236, 236))";
        setFontFamily(p, MOD_DATA.fontFamily);

        this.addElement<keyof CreateTextArgs["modules"]>(p, {
            x, y, width, height, anchor, place, fontSize, padding, modules, modulesMap: {
                base: p
            }
        });
        return p;
    }

    createInput({
        value, placeholder, x, y, width, height, textArea = false,
        fontSize = "auto", anchor = "top-left", padding, place = true,
        onChange, onInput, isDisabled, modules
    }: CreateInputArgs): HTMLInputElement | HTMLTextAreaElement {
        const input = document.createElement(textArea ? "textarea" : "input");
        input.classList.add("zcInput");
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        setFontFamily(input, MOD_DATA.fontFamily);

        if (typeof isDisabled === "function" && isDisabled()) input.classList.add("zcDisabled");
        input.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        input.addEventListener("input", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onInput === "function") onInput();
        });
        this.addElement<keyof CreateInputArgs["modules"]>(input, {
            x, y, width, height, anchor, place, fontSize, padding, modules, modulesMap: {
                base: input
            }
        });
        return input;
    }

    createCheckbox({
        text, x, y, isChecked, width, modules,
        anchor = "top-left", place = true,
        isDisabled, onChange
    }: CreateCheckboxArgs): HTMLDivElement {
        const checkbox = document.createElement("div");
        checkbox.style.display = "flex";
        checkbox.style.alignItems = "center";
        checkbox.style.columnGap = "1vw";

        const input = document.createElement("input");
        input.type = "checkbox"
        input.checked = isChecked;
        input.style.borderRadius = "min(0.8dvh, 0.3dvw)";
        input.style.aspectRatio = "1/1";
        input.classList.add("zcCheckbox", "checkbox");

        const p = document.createElement("p");
        p.textContent = text;
        p.style.color = "var(--tmd-text, black)";
        setFontFamily(p, MOD_DATA.fontFamily);

        if (typeof isDisabled === "function" && isDisabled()) checkbox.classList.add("zcDisabled");
        checkbox.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return checkbox.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        checkbox.append(input, p);
        this.addElement<keyof CreateCheckboxArgs["modules"]>(checkbox, {
            x, y, width, anchor, place, modules, modulesMap: {
                base: checkbox,
                checkbox: input,
                label: p
            }
        });
        return checkbox;
    }

    createScrollView({
        scroll, x, y, width, height,
        anchor = "top-left", modules, place = true
    }: CreateScrollViewArgs): HTMLDivElement {
        const div = document.createElement("div");
        if (scroll === "all") div.style.overflow = "scroll";
        if (scroll === "x") div.style.overflowX = "scroll";
        if (scroll === "y") div.style.overflowY = "scroll";

        this.addElement<keyof CreateScrollViewArgs["modules"]>(div, {
            x, y, width, height, anchor, place, modules, modulesMap: {
                base: div
            }
        });
        return div;
    }

    createInputList({
        x, y, width, height, title, value, modules,
        anchor = "top-left", place = true, numbersOnly = false,
        isDisabled, onChange
    }: CreateInputListArgs): HTMLDivElement {
        const items = [];
        const div = document.createElement("div");
        div.style.cssText = `
        display: flex; flex-direction: column; gap: 1vw; border: 2px solid var(--tmd-accent, black);
        border-radius: 4px; padding: 0.75vw; background: var(--tmd-element, none);
        `;
        setFontFamily(div, MOD_DATA.fontFamily);

        const buttonsElement = document.createElement("div");
        buttonsElement.style.cssText = "display: flex; justify-content: center; column-gap: 1vw; width: 100%;";

        const titleElement = document.createElement("b");
        titleElement.textContent = title + ":";
        titleElement.style.cssText = "width: 100%; font-size: clamp(10px, 2.4vw, 24px); color: var(--tmd-text, black);";

        const itemsElement = document.createElement("div");
        itemsElement.style.cssText = `display: flex; gap: 1vw; flex-wrap: wrap; align-content: flex-start;
        overflow-y: scroll;`;

        const input = document.createElement("input");
        input.style.cssText = "border: none; outline: none; background: none; height: fit-content; flex-grow: 1; padding: 0.8vw; width: 6vw; font-size: clamp(8px, 2vw, 20px);";

        const addButton = (icon: SVGElement, onClick: () => void) => {
            // const b = document.createElement("button");
            // b.style.cssText = "cursor: pointer; display: grid; place-items: center; background: var(--tmd-element-hover, #e0e0e0); width: 10%; max-width: 40px; aspect-ratio: 1/1; border-radius: 8px; border: none;";
            // icon.style.cssText = "width: 90%;";
            // b.append(icon);
            const b = this.createButton({
                icon,
                place: false,
                onClick,
                style: "default",
                modules: {
                    icon: [
                        new StyleModule({
                            width: "70%",
                            height: "70%"
                        })
                    ]
                }
            });
            b.style.width = "2em";
            b.style.aspectRatio = "1/1";
            buttonsElement.append(b);
        }

        const addItem = (text: string) => {
            const item = document.createElement("div");
            item.style.cssText = "cursor: pointer; background: var(--tmd-element-hover, rgb(206, 206, 206)); color: var(--tmd-text, black); height: fit-content; padding: 0.8vw; border-radius: 0.8vw; font-size: clamp(8px, 2vw, 20px);";
            item.textContent = text;
            itemsElement.insertBefore(item, input);
            item.addEventListener("click", (e) => {
                if (item.style.border === "") item.style.border = "2px solid red";
                else item.style.border = "";
                e.stopPropagation();
            });
            items.push(text);
        }

        addButton(createElement(CircleX), () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            itemsElement.innerHTML = "";
            items.splice(0, items.length);
            itemsElement.append(input);
            value.forEach((v) => addItem(String(v)));
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        addButton(createElement(Trash2), () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            for (const c of [...itemsElement.children]) {
                if (c.getAttribute("style").includes("border: 2px solid red;")) {
                    items.splice(items.indexOf(c.textContent), 1);
                    c.remove();
                }
            }
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        if (typeof isDisabled === "function" && isDisabled()) div.classList.add("zcDisabled");
        input.addEventListener("keypress", (e) => {
            if (document.activeElement === input) {
                switch (e.key) {
                    case "Enter":
                        if (numbersOnly && Number.isNaN(parseInt(input.value))) return;
                        if (input.value.trim() === "") return;
                        if (
                            typeof isDisabled === "function" &&
                            isDisabled()
                        ) return div.classList.add("zcDisabled");
                        addItem(input.value);
                        input.value = "";
                        if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
                        break;
                }
            }
        });
        div.addEventListener("click", (e) => { if (e.currentTarget == div) input.focus() });
        itemsElement.append(input);
        div.append(buttonsElement, titleElement, itemsElement);
        this.addElement<keyof CreateInputListArgs["modules"]>(div, {
            x, y, width, height, anchor, place, modules, modulesMap: {
                base: div,
                input
            }
        });
        value.forEach((v) => addItem(String(v)));
        return div;
    }

    createImage({
        x, y, width, src, place = true, anchor = "top-left", modules
    }: CreateImageArgs): HTMLImageElement {
        const img = document.createElement("img");
        img.style.height = "auto";
        img.src = src;

        this.addElement<keyof CreateImageArgs["modules"]>(img, {
            x, y, width, height: 0, anchor, place, modules, modulesMap: {
                base: img
            }
        });
        return img;
    }

    createSvg({
        x, y, size, dataurl, place = true, anchor = "top-left",
        fill = "var(--tmd-accent, black)", stroke = "var(--tmd-accent-hover, black)", strokeWidth = "2px", modules
    }: CreateSvgArgs): HTMLElement {
        // dataurl = dataurl.replaceAll("&quot;", `"`);
        function dataURLToSVGElement(dataURL) {
            // Извлекаем закодированную SVG строку
            const svgEncoded = dataURL.replace('data:image/svg+xml,', '');

            // Декодируем URI
            const svgString = decodeURIComponent(svgEncoded);

            // Создаем элемент
            const div = document.createElement('div');
            div.innerHTML = svgString;

            return div.firstElementChild;
        }
        function recolorSVG(svgElement, { fill, stroke }) {
            // Получаем все элементы внутри SVG
            const elements = svgElement.querySelectorAll('*');

            elements.forEach(element => {
                // Меняем fill, кроме случаев когда fill="none"
                if (element.getAttribute('fill') !== 'none') {
                    element.setAttribute('fill', fill);
                }

                // Меняем stroke, кроме случаев когда stroke="none"
                if (element.getAttribute('stroke') !== 'none') {
                    element.setAttribute('stroke', stroke);
                }
            });

            // Также меняем fill и stroke у самого корневого SVG
            if (svgElement.getAttribute('fill') !== 'none') {
                svgElement.setAttribute('fill', fill);
            }
            if (svgElement.getAttribute('stroke') !== 'none') {
                svgElement.setAttribute('stroke', stroke);
            }

            return svgElement;
        }
        const svg = dataURLToSVGElement(dataurl);
        recolorSVG(svg, { fill, stroke });
        svg.setAttribute("stroke-width", strokeWidth);
        // console.log("svg", svg)

        this.addElement<keyof CreateSvgArgs["modules"]>(svg as HTMLElement, {
            x, y, width: size, height: size, anchor, place, modules, modulesMap: {
                base: svg as HTMLElement
            }
        });
        return svg as HTMLElement;
    }

    createBackNextButton({
        x, y, width, height, items, currentIndex, modules,
        isBold = false, anchor = "top-left", place = true,
        onChange, isDisabled
    }: CreateBackNextButtonArgs): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("zcBackNextButton");
        setFontFamily(div, MOD_DATA.fontFamily);

        const updateClasses = () => {
            if (
                currentIndex === 0 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])
                )
            ) backBtn.classList.add("zcBackNextButton-btnDisabled");
            else backBtn.classList.remove("zcBackNextButton-btnDisabled");
            if (
                currentIndex === items.length - 1 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])
                )
            ) nextBtn.classList.add("zcBackNextButton-btnDisabled");
            else nextBtn.classList.remove("zcBackNextButton-btnDisabled");
        }

        const backBtn = document.createElement("button");
        backBtn.style.cssText = `
        position: absolute; left: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
        height: 140%; background-image: url("Icons/Prev.png"); background-size: 100%;
        `;
        backBtn.classList.add("zcButton");
        backBtn.addEventListener("click", () => {
            if (currentIndex === 0) return backBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])) return backBtn.classList.add("zcDisabled");
            currentIndex--;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        const nextBtn = document.createElement("button");
        nextBtn.style.cssText = `
        position: absolute; right: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
        height: 140%; background-image: url("Icons/Next.png"); background-size: 100%;
        `;
        nextBtn.classList.add("zcButton");
        nextBtn.addEventListener("click", () => {
            if (currentIndex === items.length - 1) return nextBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])) return nextBtn.classList.add("zcDisabled");
            currentIndex++;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        updateClasses();

        const text = document.createElement("p");
        if (isBold) text.style.fontWeight = "bold";
        text.textContent = items[currentIndex][0];

        div.append(backBtn, text, nextBtn);

        this.addElement<keyof CreateBackNextButtonArgs["modules"]>(div, {
            x, y, width, height, anchor, place, modules, modulesMap: {
                base: div,
                backButton: backBtn,
                nextButton: nextBtn,
                text
            }
        });
        return div;
    }

    createTabs({
        x, y, width, tabs, anchor = "top-left", place = true, currentTabName, modules
    }: CreateTabArgs): HTMLDivElement {
        let tabElements: (Node | string)[] = [];

        const tabsEl = document.createElement("div");
        tabsEl.classList.add("zcTabs");
        setFontFamily(tabsEl, MOD_DATA.fontFamily);

        tabs.forEach((tab) => {
            const switchTab = () => {
                for (const c of tabsEl.children) {
                    c.removeAttribute("data-opened");
                }
                for (const c of tabElements) {
                    if (c instanceof Node) document.body.removeChild(c);
                }
                tabElements = [];
                tabEl.setAttribute("data-opened", "true");
                const originalAppend = document.body.append.bind(document.body);
                document.body.append = (...nodes: (Node | string)[]) => {
                    tabElements.push(...nodes);
                    originalAppend(...nodes);
                };
                this.tabHandlers.unload?.();
                this.tabHandlers.exit?.();
                tab.load();
                this.tabHandlers = {
                    run: tab.run,
                    load: tab.load,
                    unload: tab.unload,
                    exit: tab.exit
                };
                document.body.append = originalAppend;
            };
            const tabEl = document.createElement("button");
            tabEl.textContent = tab.name;
            if (tab.name === currentTabName) switchTab();
            tabEl.addEventListener("click", switchTab);
            tabsEl.append(tabEl);
        });

        this.addElement<keyof CreateTabArgs["modules"]>(tabsEl, {
            x, y, width, anchor, place, modules, modulesMap: {
                base: tabsEl
            }
        });
        return tabsEl;
    }

    drawPolylineArrow({
        points, strokeColor = getThemedColorsModule()?.base?.text ?? "black", lineWidth = 2,
        circleRadius = 5, circleColor = getThemedColorsModule()?.base?.text ?? "black"
    }: DrawPolylineArrowArgs): void {
        if (points.length < 2) return;

        const ctx = MainCanvas.canvas.getContext("2d");
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

    createCard({
        x, y, name, value, icon, anchor = "top-left", place = true, modules
    }: CreateCardArgs): HTMLDivElement {
        const cardEl = document.createElement("div");
        cardEl.classList.add("zcCard");

        const cardName = document.createElement("p");
        cardName.classList.add("zcCard_name");
        cardName.textContent = name;

        const cardValue = document.createElement("p");
        cardValue.classList.add("zcCard_value");
        cardValue.textContent = `${value}`;

        if (icon) {
            icon.style.cssText += "position: absolute; top: 0.4em; right: 0.4em; width: 1.2em; height: 1.2em;";
            cardEl.append(icon);
        }

        cardEl.append(cardName, cardValue);
        this.addElement<keyof CreateCardArgs["modules"]>(cardEl, {
            x, y, anchor, place, modules, modulesMap: {
                name: cardName,
                value: cardValue,
                base: cardEl,
                icon: null
            }
        });
        return cardEl;
    }

    createSelect({
        x, y, width, options, currentOption, anchor = "top-left", place = true,
        modules, onChange, isDisabled
    }: CreateSelectArgs): HTMLDivElement {
        let isOpened = false;
        let optionsContainer: HTMLDivElement;

        const select = document.createElement("div");
        select.classList.add("zcSelect");
        select.setAttribute("opened", false);
        select.addEventListener("click", () => {
            if (isDisabled && isDisabled()) return select.classList.add("zcDisabled");
            if (isOpened) {
                isOpened = false;
                optionsContainer.remove();
            } else {
                isOpened = true;
                optionsContainer = document.createElement("div");
                optionsContainer.setAttribute(
                    "data-zc-position",
                    typeof y === "number" && y > (500 - select.offsetHeight / 2) ? "top" : "bottom"
                );
                options.forEach((option) => {
                    const e = document.createElement("div");
                    e.style.cssText = "display: flex; align-items: center; column-gap: 0.5em;";
                    if (option.icon) {
                        option.icon.style.cssText = "color: #bcbcbc;";
                        e.append(option.icon);
                    }
                    e.append(option.text);
                    if (option.name === currentOption) {
                        e.append(checkmark);
                    }
                    e.addEventListener("click", () => {
                        currentOption = option.name;
                        p.textContent = option.text;
                        optionsContainer.remove();
                        if (onChange) onChange(option.name);
                    });
                    optionsContainer.append(e);
                });
                select.append(optionsContainer);
            }
        });

        const p = document.createElement("p");
        p.textContent = options.find((option) => option.name === currentOption).text;

        const arrow = createElement(ChevronDown);
        const checkmark = createElement(Check);
        checkmark.style.cssText = "position: absolute; right: 0.25em;";

        select.append(p, arrow);

        if (isDisabled && isDisabled()) select.classList.add("zcDisabled");

        this.addElement<keyof CreateSelectArgs["modules"]>(select, {
            x, y, width, anchor, place, modules, modulesMap: {
                base: select
            }
        });
        return select;
    }

    createContainer({
        x, y, width, height, anchor = "top-left", place = true, modules
    }: CreateContainerArgs): HTMLDivElement {
        const container = document.createElement("div");

        this.addElement<keyof CreateContainerArgs["modules"]>(container, {
            x, y, width, height, anchor, place, modules, modulesMap: {
                base: container
            }
        });
        return container;
    }
}

const subscreenHooks: Record<string, ((subscreen: BaseSubscreen) => void)[]> = {};

export function hookSubscreen(subscreenName: string, hook: (subscreen: BaseSubscreen) => void) {
    if (!subscreenHooks[subscreenName]) subscreenHooks[subscreenName] = [];
    subscreenHooks[subscreenName].push(hook);
}