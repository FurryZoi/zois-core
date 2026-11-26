import {
    hookFunction as registerHookFunction,
    patchFunction as registerPatchFunction,
    HookPriority
} from "../patching";
import { logger } from "../logging";

export class ModuleContext {
    private readonly cleanups: Set<() => void> = new Set();
    private disposed: boolean = false;

    public constructor() { }

    private registerCleanup(cleanup: () => void): () => void {
        let active: boolean = true;

        const dispose: () => void = (): void => {
            if (!active) return;

            active = false;
            this.cleanups.delete(dispose);

            try {
                cleanup();
            } catch (error: unknown) {
                logger.error("Failed to remove module hook or patch:", error);
            }
        };

        this.cleanups.add(dispose);

        return dispose;
    }

    public hookFunction<TFunctionName extends string>(
        functionName: TFunctionName,
        priority: HookPriority,
        hook: PatchHook<GetDotedPathType<typeof globalThis, TFunctionName>>
    ): () => void {
        if (this.disposed) {
            throw new Error("ModuleContext has already been disposed");
        }

        const removeHook: () => void = registerHookFunction(
            functionName,
            priority,
            hook
        );

        return this.registerCleanup(removeHook);
    }

    public patchFunction(functionName: string, patches: Record<string, string | null>): () => void {
        if (this.disposed) {
            throw new Error("ModuleContext has already been disposed");
        }

        const removePatch: () => void = registerPatchFunction(
            functionName,
            patches
        );

        return this.registerCleanup(removePatch);
    }

    public dispose(): void {
        if (this.disposed) return;

        this.disposed = true;

        for (const cleanup of [...this.cleanups].reverse()) {
            cleanup();
        }

        this.cleanups.clear();
    }
}