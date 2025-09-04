import { BaseModule, Context, ModuleTarget } from "../modules";


export class StyleModule extends BaseModule {
    constructor(private style: Partial<CSSStyleDeclaration>) {
        super();
    }

    layoutEffect(context: Context, target: ModuleTarget) {
        for (const styleProperty of Object.keys(this.style)) {
            target.style[styleProperty] = this.style[styleProperty];
        }
    }
}