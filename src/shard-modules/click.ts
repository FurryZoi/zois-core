import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./base";

export class ClickModule extends ShardModule {
    constructor(private callback: (target: ShardModuleTarget) => void) {
        super();
    }
    
    public beforeMount(context: ShardContext, target: ShardModuleTarget): void {
        target.addEventListener("click", () => this.callback(target));
    }
}