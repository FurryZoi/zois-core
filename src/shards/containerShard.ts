import { addDynamicClass, DynamicClassStyles } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface ContainerShardContext extends ShardContext<"content" | "scrollbar"> {
    scroll?: "x" | "y" | "all" | "none" | "auto";
}

export class ContainerShard extends Shard<ContainerShardContext> {
    protected get dynamicClassContainer(): DynamicClassStyles {
        return {
            base: {},
            "> div:first-child::-webkit-scrollbar": {
                display: "none"
            },
            "> div:first-child": {
                scrollbarWidth: "none"
            }
        };
    }

    protected override get mountReturnValue(): HTMLElement | SVGElement | null {
        return this.body?.content ?? null;
    }

    override generateBody(): Record<
        keyof NonNullable<ContainerShardContext["modules"]>,
        HTMLElement | SVGElement
    > {
        const scrollMode = this.context.scroll ?? "auto";

        const container = document.createElement("div");
        container.style.position = "relative";
        addDynamicClass(container, this.dynamicClassContainer);

        const mayNeedVerticalScrollbar =
            scrollMode === "y" || scrollMode === "all" || scrollMode === "auto";

        const containerContent = document.createElement("div");
        containerContent.style.width = "100%";
        containerContent.style.height = "100%";
        containerContent.style.boxSizing = "border-box";

        switch (scrollMode) {
            case "all":
                containerContent.style.overflow = "scroll";
                break;
            case "x":
                containerContent.style.overflowX = "scroll";
                containerContent.style.overflowY = "hidden";
                break;
            case "y":
                containerContent.style.overflowY = "scroll";
                containerContent.style.overflowX = "hidden";
                break;
            case "none":
                containerContent.style.overflow = "unset";
                break;
            case "auto":
            default:
                containerContent.style.overflow = "auto";
                break;
        }

        const scrollbar = document.createElement("div");
        scrollbar.style.cssText = `
      position: absolute;
      right: 0;
      top: 50%;
      display: none;
      flex-direction: column;
      gap: calc(var(--size-unit) * 1.25px);
      transform: translateY(-50%);
      pointer-events: none;
      z-index: 10;
      width: calc(var(--size-unit) * 1.25px);
    `;

        const diamonds: HTMLElement[] = [];

        for (let i = 0; i < 6; i++) {
            const diamond = document.createElement("div");
            diamond.style.cssText = `
        transform: rotate(45deg);
        width: 100%;
        aspect-ratio: 1/1;
        background: var(--tmd-element, gray);
        border: 1px solid var(--tmd-accent, black);
        transition: background 0.15s ease, transform 0.15s ease;
      `;
            scrollbar.append(diamond);
            diamonds.push(diamond);
        }

        const updateIndicators = () => {
            const maxScroll = containerContent.scrollHeight - containerContent.clientHeight;

            if (maxScroll <= 1) {
                diamonds.forEach((d) => {
                    d.style.background = "var(--tmd-element, gray)";
                    d.style.transform = "rotate(45deg) scale(1)";
                });
                return;
            }

            const progress = Math.min(1, Math.max(0, containerContent.scrollTop / maxScroll));
            const activeIndex = Math.round(progress * (diamonds.length - 1));

            diamonds.forEach((diamond, i) => {
                if (i === activeIndex) {
                    diamond.style.background = "var(--tmd-accent, #fff)";
                    diamond.style.transform = "rotate(45deg) scale(1.25)";
                } else if (i < activeIndex) {
                    diamond.style.background = "var(--tmd-element, #aaa)";
                    diamond.style.transform = "rotate(45deg) scale(1)";
                } else {
                    diamond.style.background = "var(--tmd-element-hover, gray)";
                    diamond.style.transform = "rotate(45deg) scale(1)";
                }
            });
        };

        containerContent.addEventListener("scroll", updateIndicators, { passive: true });

        const needsVerticalScrollbar = scrollMode === "y" || scrollMode === "all";

        const updateScrollbarVisibility = () => {
            const isOverflowing = containerContent.scrollHeight - containerContent.clientHeight > 1;
            const shouldShow = needsVerticalScrollbar || (scrollMode === "auto" && isOverflowing);

            containerContent.style.paddingRight = shouldShow ? "min(2vw, 2vh)" : "";
            scrollbar.style.display = shouldShow ? "flex" : "none";
            updateIndicators();
        };

        if (mayNeedVerticalScrollbar) {
            const resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(updateScrollbarVisibility);
            });
            resizeObserver.observe(containerContent);

            const mutationObserver = new MutationObserver(() => {
                requestAnimationFrame(updateScrollbarVisibility);
            });
            mutationObserver.observe(containerContent, {
                childList: true,
                subtree: true,
                characterData: true,
            });

            requestAnimationFrame(updateScrollbarVisibility);
        }

        container.append(containerContent, scrollbar);

        return {
            base: container,
            content: containerContent,
            scrollbar,
        };
    }
}