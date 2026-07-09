import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";

export class ClickModule extends ShardModule {
    constructor(private callback: (target: ShardModuleTarget) => void) {
        super();
    }
    
    override layoutEffect(context: ShardContext, target: ShardModuleTarget): void {
        target.addEventListener("click", () => this.callback(target));
    }
}