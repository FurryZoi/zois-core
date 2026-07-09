import { CoreSubscreen } from "./coreSubscreen";

export class DevelopmentSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Development"
    }

    override load(): void {
        super.load();
        this.createCheckbox({
            x: 60,
            y: 200,
            text: "Auto Connect To Dev Server",
            isChecked: localStorage.getItem("autoConnectToDevServer") === "true",
            onChange: () => {
                const prev = localStorage.getItem("autoConnectToDevServer");
                localStorage.setItem("autoConnectToDevServer", prev === "true" ? "false" : "true");
                
            }
        });
    }
}