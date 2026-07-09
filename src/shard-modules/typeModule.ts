import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";

function type(
    element: ShardModuleTarget,
    duration: number,
): void {
    if (!element) {
        throw new Error('Element not found');
    }

    const endValue = element.textContent;
    element.textContent = "\u00A0";
    element.classList.add("zcCursor");

    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        let progress = Math.min(elapsed / duration, 1);
        const currentValue = endValue.slice(0, parseInt(endValue.length * progress));
        if (currentValue.trim() !== "") element.textContent = currentValue;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            setTimeout(() => element.classList.remove("zcCursor"), duration / endValue.length);
        }
    };

    animationFrameId = requestAnimationFrame(animate);
}

interface TypeModuleProps {
    duration: number
}

export class TypeModule extends ShardModule {
    constructor(private readonly props: TypeModuleProps) {
        super();
    }

    override effect(context: ShardContext, target: ShardModuleTarget) {
        type(target, this.props.duration);
    }
}