import { logger } from "../logging";
import { BaseModule } from "./baseModule";
import { ModuleContext } from "./moduleContext";
import {
    getLoadingStrategy,
    ModuleLoadingStrategy
} from "./loadingStrategy";
import { MOD_DATA } from "../index";

export class ModulesManager {
    private readonly modules: Map<string, BaseModule> = new Map();
    private readonly initialized: Set<string> = new Set();
    private readonly loaded: Set<string> = new Set();
    private readonly contexts: Map<string, ModuleContext> = new Map();

    public registerModules(): void {
        const modules = Object.values(MOD_DATA.modules ?? {}).map((Module) => {
            return new Module();
        });

        for (const module of modules) {
            const name = module.constructor.name;

            if (this.modules.has(name)) {
                logger.error(`Module "${name}" is already registered`);
                continue;
            }

            this.modules.set(name, module);
        }
    }

    public get<T extends BaseModule>(name: string): T | undefined {
        return this.modules.get(name) as T | undefined;
    }

    public getAll(): BaseModule[] {
        return [...this.modules.values()];
    }

    public getLoaded(): BaseModule[] {
        return [...this.loaded]
            .map((name) => this.get(name))
            .filter((module) => module !== undefined);
    }

    public isInitialized(name: string): boolean {
        return this.initialized.has(name);
    }

    public isLoaded(name: string): boolean {
        return this.loaded.has(name);
    }

    public init(name: string): boolean {
        const module = this.get(name);

        if (!module || !module.enabled || this.initialized.has(name)) {
            return false;
        }

        try {
            module.onInit();
            this.initialized.add(name);

            return true;
        } catch (error: unknown) {
            logger.error(`Module "${name}" failed during "init":`, error);
            return false;
        }
    }

    public load(name: string): boolean {
        const module = this.get(name);

        if (!module || !module.enabled || this.loaded.has(name)) {
            return false;
        }

        const strategy = getLoadingStrategy(module.constructor);

        if (strategy === undefined) {
            logger.error(`Module "${name}" does not have a LoadingStrategy decorator`);
            return false;
        }

        if (!this.initialized.has(name)) {
            if (!this.init(name)) {
                return false;
            }
        }

        const context = new ModuleContext();

        try {
            module.onLoad(context);

            this.contexts.set(name, context);
            this.loaded.add(name);

            return true;
        } catch (error: unknown) {
            logger.error(`Module "${name}" failed during "load":`, error);
            context.dispose();
            logger.log(`Disposed ${name}'s context`);

            return false;
        }
    }

    public loadByStrategy(strategy: ModuleLoadingStrategy): void {
        const loaded: string[] = [];
        const failed: string[] = [];
        for (const [name, module] of this.modules) {
            const moduleStrategy = getLoadingStrategy(module.constructor);

            if (moduleStrategy === undefined) {
                logger.error(`Module "${name}" does not have a LoadingStrategy decorator`);
                continue;
            }

            if (moduleStrategy !== strategy) {
                continue;
            }

            if (this.load(name)) loaded.push(name);
            else failed.push(name);
        }
        logger.log(`Loaded modules during ${strategy} phase (${loaded.length}):`, loaded);
        logger.log(`Failed modules during ${strategy} phase (${failed.length}):`, failed);
    }

    public unload(name: string): boolean {
        const module = this.get(name);

        if (!module || !this.loaded.has(name)) {
            return false;
        }

        let success: boolean = true;

        try {
            module.onUnload();
        } catch (error: unknown) {
            logger.error(`Module "${name}" failed during "unload":`, error);
            success = false;
        } finally {
            this.contexts.get(name)?.dispose();
            this.contexts.delete(name);
            this.loaded.delete(name);
        }

        return success;
    }

    public reload(name: string): boolean {
        const module = this.modules.get(name);

        if (!module || !module.enabled || !this.loaded.has(name)) {
            return false;
        }

        if (!this.unload(name)) {
            return false;
        }

        try {
            module.onReload();
        } catch (error: unknown) {
            logger.error(`Module "${name}" failed during "reload":`, error);
            return false;
        }

        return this.load(name);
    }

    public safeword(name?: string): void {
        if (name !== undefined) {
            const module = this.modules.get(name);

            if (!module || !this.loaded.has(name)) {
                return;
            }

            try {
                module.onSafeword();
            } catch (error: unknown) {
                logger.error(`Module "${name}" failed during "safeword":`, error);
            }

            return;
        }

        for (const [moduleName, module] of this.modules) {
            if (!this.loaded.has(moduleName)) {
                continue;
            }

            try {
                module.onSafeword();
            } catch (error: unknown) {
                logger.error(`Module "${moduleName}" failed during "safeword":`, error);
            }
        }
    }

    public unloadAll(): void {
        for (const name of [...this.loaded]) {
            this.unload(name);
        }
    }

    public reloadAll(): void {
        for (const name of [...this.loaded]) {
            this.reload(name);
        }
    }
}

export const modulesManager = new ModulesManager();
