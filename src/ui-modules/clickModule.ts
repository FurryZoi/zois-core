import { BaseModule, Context, ModuleTarget } from "zois-core/modules";

export class ClickModule extends BaseModule {
    constructor(private callback: (target: ModuleTarget) => void) {
        super();
    }
    
    layoutEffect(context: Context, target: ModuleTarget): void {
        target.addEventListener("click", () => this.callback(target));
    }
}