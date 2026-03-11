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
    }
    ZOISCORE_MODS: {
        name: string
        fullName: string
        key: string
        version: string
        deepLinkSubscreens: import("@/ui").BaseSubscreen[]
    }[]
}