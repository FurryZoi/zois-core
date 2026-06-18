import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";


export class StyleModule extends ShardModule {
    constructor(private style: Partial<CSSStyleDeclaration>) {
        super();
    }

    private applyStyle(target: ShardModuleTarget, style: Partial<Omit<CSSStyleDeclaration, "length" | "parentRule" | typeof Symbol.iterator>>): void {
        for (const styleProperty of Object.keys(style) as (keyof typeof style)[]) {
            if (!isNaN(styleProperty as unknown as number) || typeof style[styleProperty] === "function" || typeof style[styleProperty] === "undefined") continue;
            // @ts-expect-error
            target.style[styleProperty] = style[styleProperty];
        }
    }

    override layoutEffect(context: ShardContext, target: ShardModuleTarget) {
        this.applyStyle(target, this.style);
    }
}