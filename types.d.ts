declare module "*.css" {
    const content: string;
    export default content;
};
declare module "*.png";
declare module '*.svg' {
    import * as React from 'react';

    const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    export default ReactComponent;
}

interface Window {
    ZOISCORE: {
        loaded: boolean
        useToastsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<import("@/popups").ToastsStore>>
        useDialogStore: import("zustand").UseBoundStore<import("zustand").StoreApi<import("@/popups").DialogStore>>
        setSubscreen: (subscreen: string | null, constructorParams?: unknown[], callback?: (subscreen: import("@/ui").BaseSubscreen) => void) => void
        setSubscreenPrevious: () => void
        getCurrentSubscreen: () => import("@/ui").BaseSubscreen | null
        getPreviousSubscreen: () => import("@/ui").BaseSubscreen | null
    }
}