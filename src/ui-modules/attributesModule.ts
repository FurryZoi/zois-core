import { Attributes } from "react";
import { BaseModule, Context, ModuleTarget } from "../modules";


export class AttributesModule extends BaseModule {
    constructor(private attributes: Record<string, string>) {
        super();
    }

    layoutEffect(context: Context, target: ModuleTarget) {
        for (const attributeProperty of Object.keys(this.attributes)) {
            target.setAttribute(attributeProperty, this.attributes[attributeProperty]);
        }
    }
}