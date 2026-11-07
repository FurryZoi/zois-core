import { addDynamicClass, DynamicClassStyles } from "../ui";
import { ShardModule, ShardModuleTarget } from "./base";
import { ShardContext } from "../shards";


export class DynamicClassModule extends ShardModule {
    constructor(private style: DynamicClassStyles) {
        super();
    }

    public beforeMount(context: ShardContext, target: ShardModuleTarget) {
        addDynamicClass(target as HTMLElement, this.style);
    }
}