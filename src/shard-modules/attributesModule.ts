import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";


export class AttributesModule extends ShardModule {
    constructor(private attributes: Record<string, string>) {
        super();
    }

    override layoutEffect(context: ShardContext, target: ShardModuleTarget) {
        for (const attributeProperty of Object.keys(this.attributes)) {
            target.setAttribute(attributeProperty, this.attributes[attributeProperty]);
        }
    }
}