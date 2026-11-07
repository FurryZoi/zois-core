import { ShardContext } from "../shards";

export type ShardModuleTarget = HTMLElement | SVGElement;

export abstract class ShardModule<Context extends ShardContext = ShardContext> {
    public overrideContext(context: Context, target: ShardModuleTarget): Context {
        return context;
    }
    public beforeMount(context: Context, target: ShardModuleTarget) {}
    public onMount(context: Context, target: ShardModuleTarget) {}
}