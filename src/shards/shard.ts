import { SubscreenUnloadedEvent } from "..";
import { MOD_DATA } from "../index";
import { logger } from "../logging";
import { ShardModule, ShardModuleTarget, StyleModule } from "../shard-modules";
import { setFontFamily, setPosition, autosetFontSize, setFontSize, setPadding, getRelativeWidth, getRelativeHeight, Anchor, BaseSubscreen } from "../ui";

export interface ShardContext<T extends string = never> {
    x?: number
    y?: number
    anchor?: Anchor
    padding?: number
    width?: number
    height?: number
    parent?: HTMLElement
    modules?: Partial<Record<T | "base", ShardModule[]>>
}

export abstract class Shard<Context extends ShardContext = ShardContext> {
    protected body: Record<keyof NonNullable<Context["modules"]>, HTMLElement | SVGElement> | null = null;

    constructor(protected context: Context) {
        this.body = this.generateBody();
        this.processModules("overrideContext");
        this.processModules("layoutEffect");
    }

    public mount(parentElement: HTMLElement = this.context.parent ?? document.body) {
        parentElement.append(this.body!.base);
        this.update();
        this.processModules("effect");
        window.addEventListener("resize", () => this.update());
        const onUnload = (event: Event) => {
            if (!(event instanceof SubscreenUnloadedEvent)) return;
            this.body!.base.remove();
            window.removeEventListener("zois-core:subscreenunloaded", onUnload);
        };
        window.addEventListener("zois-core:subscreenunloaded", onUnload);
        return this.body!.base;
    }

    protected abstract generateBody(): Record<keyof NonNullable<Context["modules"]>, HTMLElement | SVGElement>

    protected processModules(stage: "overrideContext" | "layoutEffect" | "effect") {
        const modules = this.context.modules ?? {};

        if (stage === "effect") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        try {
                            this.context = <Context>module.overrideContext(this.context, this.body![key]);
                        } catch (e) {
                            logger.error("OverrideContext call failed in", module);
                        }
                    }
                }
            }
        }

        if (stage === "layoutEffect") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        try {
                            module.layoutEffect(this.context, this.body![key]);
                        } catch {
                            logger.error("LayoutEffect call failed in", module);
                        }
                    }
                }
            }
        }

        if (stage === "effect") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        try {
                            module.effect(this.context, this.body![key]);
                        } catch {
                            logger.error("Effect call failed in", module);
                        }
                    }
                }
            }
        }
    }

    protected update() {
        const { x, y, anchor, padding, width, height } = this.context;
        if (typeof x === "number" && typeof y === "number") setPosition(this.body!.base as HTMLElement, x, y, anchor);
        if (padding) setPadding(this.body!.base as HTMLElement, padding);
        if (width) this.body!.base.style.width = getRelativeWidth(width) + "px";
        if (height) this.body!.base.style.height = getRelativeHeight(height) + "px";
    }
}