import { addDynamicClass, DynamicClassStyles } from "../ui";
import { BaseModule, Context, ModuleTarget } from "../modules";


export class DynamicClassModule extends BaseModule {
    constructor(private style: DynamicClassStyles) {
        super();
    }

    public layoutEffect(context: Context, target: ModuleTarget) {
        addDynamicClass(target as HTMLElement, this.style);
    }
}