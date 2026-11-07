import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./base";

export class CenterModule extends ShardModule<ShardContext> {
    public overrideContext(context: ShardContext, target: HTMLElement): ShardContext {
        context.x = 1000;
        context.y = 500;
        return context;
    }

    public beforeMount(context: ShardContext<never>, target: ShardModuleTarget): void {
        target.style.transform = "translate(-50%, -50%)";
    }
}