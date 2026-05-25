import { BaseModule, Context, ModuleTarget } from "../modules";

function countUp(
    element: ModuleTarget,
    endValue: number,
    duration: number,
    formattingFunction?: (value: number) => string
): void {
    if (!element) {
        throw new Error('Element not found');
    }

    let startValue = 0;
    let startTime: number;
    let animationFrameId: number | undefined;

    const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        let progress = Math.min(elapsed / duration, 1);
        const easedProgress = progress * (2 - progress);

        const currentValue = parseInt(startValue + (endValue - startValue) * easedProgress);
        element.textContent = typeof formattingFunction === "function" ? formattingFunction(currentValue) : currentValue.toString();

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        }
    };

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(animate);
}

interface CounterUpModuleProps {
    duration: number
    endValue: number
    formattingFunction?: (value: number) => string
}

export class CounterUpModule extends BaseModule {
    constructor(private props: CounterUpModuleProps) {
        super();
    }

    effect(context: Context, target: ModuleTarget) {
        countUp(target, this.props.endValue, this.props.duration, this.props.formattingFunction);
    }
}