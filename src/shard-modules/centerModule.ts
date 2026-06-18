import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";

export class CenterModule extends ShardModule<ShardContext> {
    override overrideContext(context: ShardContext, target: HTMLElement): ShardContext {
        target.style.cssText += "transform: translate(-50%, -50%);";
        context.x = 1000;
        context.y = 500;
        return context;
    }
}