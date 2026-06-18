import { ShardContext } from "../shards";
import { Anchor } from "../ui"

export type ShardModuleTarget = HTMLElement | SVGElement;

export abstract class ShardModule<Context extends ShardContext = ShardContext> {
    public overrideContext(context: Context, target: ShardModuleTarget): Context {
        return context;
    }
    public layoutEffect(context: Context, target: ShardModuleTarget) {}
    public effect(context: Context, target: ShardModuleTarget) {}
}