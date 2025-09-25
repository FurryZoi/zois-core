import { BaseModule, Context, ModuleTarget } from "../modules";


export class StyleModule extends BaseModule {
    constructor(private style: Partial<CSSStyleDeclaration>) {
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
    }
}