import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";

export class CenterModule extends ShardModule<ShardContext> {
    override overrideContext(context: ShardContext, target: HTMLElement): ShardContext {
        context.x = 1000;
        context.y = 500;
        return context;
    }

    public layoutEffect(context: ShardContext<never>, target: ShardModuleTarget): void {
        target.style.transform = "translate(-50%, -50%)";
    }
}