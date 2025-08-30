import { BaseModule, Context, ModuleTarget } from "../modules";

function type(
    element: ModuleTarget,
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

export class TypeModule extends BaseModule {
    constructor(private props: TypeModuleProps) {
        super();
    }

    effect(context: Context, target: ModuleTarget) {
        type(target, this.props.duration);
    }
}