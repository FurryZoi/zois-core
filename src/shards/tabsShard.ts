import { eventBus } from "../events";
import { MOD_DATA } from "../index";
import { hookFunction, HookPriority } from "../modSdk";
import { autosetFontSize, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface TabsShardContext extends Omit<ShardContext, "height"> {
    tabs: {
        name: string
        load?: () => void
        unload?: () => void
        run?: () => void
    }[]
    currentTabName: string
}

export class TabsShard extends Shard<TabsShardContext> {
    constructor(context: TabsShardContext) {
        super(context);
    }

    protected generateBody(): Record<keyof NonNullable<TabsShardContext["modules"]>, HTMLElement | SVGElement> {
        let tabHandlers: {
            run?: () => void
            load?: () => void
            unload?: () => void
        } = {};
        let clearDrawProcessHook: (() => void) | null = null;

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

                clearDrawProcessHook?.();
                clearDrawProcessHook = null;
                tabHandlers.unload?.();
                tabHandlers = {
                    run: tab.run,
                    load: tab.load,
                    unload: tab.unload
                };
                tabHandlers.load?.();

                if (tab.run) {
                    clearDrawProcessHook = hookFunction("DrawProcess", HookPriority.ADD_BEHAVIOR, (args, next) => {
                        next(args);
                        tab.run?.();
                    });
                }

                document.body.append = originalAppend;
            };

            const tabEl = document.createElement("button");
            tabEl.textContent = tab.name;
            if (tab.name === currentTabName) switchTab();
            tabEl.addEventListener("click", switchTab);
            tabsEl.append(tabEl);
        });

        eventBus?.once("subscreenUnloaded", () => {
            clearDrawProcessHook?.();
            tabHandlers.unload?.();
        });

        return {
            base: tabsEl
        };
    }

    protected update() {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}