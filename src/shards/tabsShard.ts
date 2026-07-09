import { MOD_DATA } from "../index";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface TabsShardContext extends Omit<ShardContext, "height"> {
    tabs: {
        name: string
        load?: () => void
        unload?: () => void
        run?: () => void
        exit?: () => void
    }[]
    currentTabName: string
}

export class TabsShard extends Shard<TabsShardContext> {
    private tabHandlers: Omit<TabsShardContext["tabs"][0], "name"> = {};

    constructor(context: TabsShardContext) {
        // this.tabHandlers = {};
        super(context);
    }

    override generateBody(): Record<keyof NonNullable<TabsShardContext["modules"]>, HTMLElement | SVGElement> {
        this.tabHandlers ??= {};
        const { tabs, currentTabName } = this.context;
        let tabElements: (Node | string)[] = [];

        const tabsEl = document.createElement("div");
        tabsEl.classList.add("zcTabs");
        setFontFamily(tabsEl, MOD_DATA.fontFamily);

        tabs.forEach((tab) => {
            const switchTab = () => {
                for (const c of tabsEl.children) {
                    c.removeAttribute("data-opened");
                }
                for (const c of tabElements) {
                    if (c instanceof Node) document.body.removeChild(c);
                }
                tabElements = [];
                tabEl.setAttribute("data-opened", "true");
                const originalAppend = document.body.append.bind(document.body);
                document.body.append = (...nodes: (Node | string)[]) => {
                    tabElements.push(...nodes);
                    originalAppend(...nodes);
                };
                this.tabHandlers.unload?.();
                this.tabHandlers.exit?.();
                this.tabHandlers = {
                    run: tab.run,
                    load: tab.load,
                    unload: tab.unload,
                    exit: tab.exit
                };
                this.tabHandlers.load?.();
                document.body.append = originalAppend;
            };
            const tabEl = document.createElement("button");
            tabEl.textContent = tab.name;
            if (tab.name === currentTabName) switchTab();
            tabEl.addEventListener("click", switchTab);
            tabsEl.append(tabEl);
        });

        return {
            base: tabsEl
        }
    }

    override update() {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}
