export enum ModuleLoadingStrategy {
    BeforeLogin = "beforeLogin",
    AfterLogin = "afterLogin",
    Manual = "manual"
}

const MODULE_LOADING_STRATEGIES: WeakMap<Function, ModuleLoadingStrategy> = new WeakMap();

export function LoadingStrategy(
    strategy: ModuleLoadingStrategy
): ClassDecorator {
    return (constructor: Function): void => {
        MODULE_LOADING_STRATEGIES.set(constructor, strategy);
    };
}

export function getLoadingStrategy(
    constructor: Function
): ModuleLoadingStrategy | undefined {
    return MODULE_LOADING_STRATEGIES.get(constructor);
}