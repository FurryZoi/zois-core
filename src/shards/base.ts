import { eventBus } from "../events";
import { logger } from "../logging";
import { ShardModule } from "../shard-modules";
import { setPosition, setPadding, getRelativeWidth, getRelativeHeight, Anchor } from "../ui";

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
    public body: Record<keyof NonNullable<Context["modules"]>, HTMLElement | SVGElement> | null = null;

    protected get mountReturnValue() {
        return this.body?.base ?? null;
    }

    constructor(protected context: Context) {
        this.body = this.render();
        this.processModules("overrideContext");
    }
    
    public mount(parentElement: HTMLElement = this.context.parent ?? document.body) {
        this.processModules("layoutEffect");
        parentElement.append(this.body!.base);
        this.setContextStyles();
        this.processModules("effect");
        eventBus?.once("subscreenUnloaded", this.unmount.bind(this));
        eventBus?.emit("shardMounted", {
            shard: this
        });
        return this.mountReturnValue;
    }

    public unmount() {
        this.body!.base.remove();
        eventBus?.emit("shardUnmounted", {
            shard: this
        });
    }

    protected abstract render(): Record<keyof NonNullable<Context["modules"]>, HTMLElement | SVGElement>

    protected processModules(stage: "overrideContext" | "layoutEffect" | "effect") {
        const modules = this.context.modules ?? {};

        if (stage === "overrideContext") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        if (this.body?.[key]) {
                            try {
                                this.context = <Context>module.overrideContext(this.context, this.body[key]);
                            } catch (e) {
                                logger.error("OverrideContext call failed in", module, e);
                            }
                        }
                    }
                }
            }
        }

        if (stage === "layoutEffect") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        if (this.body?.[key]) {
                            try {
                                module.beforeMount(this.context, this.body[key]);
                            } catch (e) {
                                logger.error("LayoutEffect call failed in", module, e);
                            }
                        }
                    }
                }
            }
        }

        if (stage === "effect") {
            for (const key of Object.keys(modules) as (keyof typeof modules)[]) {
                for (const module of modules[key] ?? []) {
                    if (module instanceof ShardModule) {
                        if (this.body?.[key]) {
                            try {
                                module.onMount(this.context, this.body[key]);
                            } catch (e) {
                                logger.error("Effect call failed in", module, e);
                            }
                        }
                    }
                }
            }
        }
    }

    protected setContextStyles() {
        const { x, y, anchor, padding, width, height } = this.context;
        if (typeof x === "number" && typeof y === "number") setPosition(this.body!.base as HTMLElement, x, y, anchor);
        if (padding) setPadding(this.body!.base as HTMLElement, padding);
        if (width) this.body!.base.style.width = getRelativeWidth(width);
        if (height) this.body!.base.style.height = getRelativeHeight(height);
    }
}