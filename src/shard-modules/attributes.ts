import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./base";


export class AttributesModule extends ShardModule {
    constructor(private attributes: Record<string, string>) {
        super();
    }

    public beforeMount(context: ShardContext, target: ShardModuleTarget) {
        for (const attributeProperty of Object.keys(this.attributes)) {
            target.setAttribute(attributeProperty, this.attributes[attributeProperty]);
        }
    }
}