import { BaseModule, Context, ModuleTarget } from "../modules";


export class StyleModule extends BaseModule {
    constructor(private style: Partial<CSSStyleDeclaration>) {
        super();
    }

    private applyStyle(target: ModuleTarget, style: Partial<Omit<CSSStyleDeclaration, "length" | "parentRule" | typeof Symbol.iterator>>): void {
        for (const styleProperty of Object.keys(style) as (keyof typeof style)[]) {
            if (!isNaN(styleProperty as unknown as number) || typeof style[styleProperty] === "function" || typeof style[styleProperty] === "undefined") continue;
            // @ts-expect-error
            target.style[styleProperty] = style[styleProperty];
        }
    }

    public layoutEffect(context: Context, target: ModuleTarget) {
        this.applyStyle(target, this.style);
    }
}