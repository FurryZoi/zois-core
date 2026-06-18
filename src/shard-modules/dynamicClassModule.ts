import { addDynamicClass, DynamicClassStyles } from "../ui";
import { ShardModule, ShardModuleTarget } from "./shardModule";
import { ShardContext } from "../shards";


export class DynamicClassModule extends ShardModule {
    constructor(private style: DynamicClassStyles) {
        super();
    }

    override layoutEffect(context: ShardContext, target: ShardModuleTarget) {
        addDynamicClass(target as HTMLElement, this.style);
    }
}