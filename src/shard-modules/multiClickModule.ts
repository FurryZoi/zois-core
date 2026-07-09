import { ShardContext } from "../shards";
import { ShardModule, ShardModuleTarget } from "./shardModule";

function addMultiClickListener(element: Element, n: number, callback: () => void, timeout = 400) {
    let clickCount = 0;
    let timer: number | null = null;

    const handler = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        clickCount++;

        if (clickCount === n) {
            callback();
            clickCount = 0;
            return;
        }

        timer = setTimeout(() => {
            clickCount = 0;
            timer = null;
        }, timeout);
    };

    element.addEventListener('click', handler);

    return () => {
        element.removeEventListener('click', handler);
        if (timer) {
            clearTimeout(timer);
        }
    };
}

interface MultiClickModuleProps {
    n: number
    callback: () => void
}

export class MultiClickModule extends ShardModule<ShardContext> {
    constructor(private readonly props: MultiClickModuleProps) {
        super();
    }

    override effect(context: ShardContext<never>, target: ShardModuleTarget): void {
        addMultiClickListener(target, this.props.n, this.props.callback);
    }
}