import { BaseModule, Context, ModuleTarget } from "../modules";


export class StyleModule extends BaseModule {
    constructor(
        private style: Partial<CSSStyleDeclaration>,
        private extended?: Partial<Record<"click" | "hover", Partial<CSSStyleDeclaration>>>
    ) {
        super();
    }

    private applyStyle(target: ModuleTarget, style: Partial<CSSStyleDeclaration>): void {
        for (const styleProperty of Object.keys(style)) {
            if (!isNaN(styleProperty as unknown as number) || typeof style[styleProperty] === "function") continue;
            target.style[styleProperty] = style[styleProperty];
        }
    }

    layoutEffect(context: Context, target: ModuleTarget) {
        this.applyStyle(target, this.style);
        const originalStyle = Object.assign({}, target.style);
        if (this.extended?.click) {
            target.addEventListener("click", () => {
                this.applyStyle(target, this.extended.click);
                setTimeout(() => this.applyStyle(target, originalStyle), 250);
            });
        }
        if (this.extended?.hover) {
            target.addEventListener("mouseenter", () => {
                this.applyStyle(target, this.extended.hover);
            });
            target.addEventListener("mouseleave", () => {
                // console.log(originalStyle);
                this.applyStyle(target, originalStyle);
            });
        }
    }
}