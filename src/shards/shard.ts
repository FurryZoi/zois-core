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
        this.body = this.generateBody();
        this.processModules("overrideContext");
        this.processModules("layoutEffect");
    }

    public mount(parentElement: HTMLElement = this.context.parent ?? document.body) {
        parentElement.append(this.body!.base);
        this.update();
        this.processModules("effect");
        eventBus?.emit("shardMounted", {
            shard: this
        });
        window.addEventListener("resize", () => this.update());
        eventBus?.once("subscreenUnloaded", () => {
            this.body!.base.remove();
            eventBus?.emit("shardUnmounted", {
                shard: this
            });
        });
        return this.mountReturnValue;
    }

    protected abstract generateBody(): Record<keyof NonNullable<Context["modules"]>, HTMLElement | SVGElement>

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
                                module.layoutEffect(this.context, this.body[key]);
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
                                module.effect(this.context, this.body[key]);
                            } catch (e) {
                                logger.error("Effect call failed in", module, e);
                            }
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