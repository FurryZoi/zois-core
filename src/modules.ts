import { Anchor } from "./ui"

export interface Context {
    anchor?: Anchor
    x?: number
    y?: number
    width?: number
    height?: number
    padding?: number
    fontSize?: number | "auto"
    place?: boolean
    element: HTMLElement
}

export type ModuleTarget = HTMLElement | SVGElement;

export abstract class BaseModule {
    public overrideProperties(context: Context, target: ModuleTarget): Context {
        return context;
    }
    public layoutEffect(context: Context, target: ModuleTarget): void { }
    public effect(context: Context, target: ModuleTarget): void { }
}