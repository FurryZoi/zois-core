
import { ModuleContext } from "./moduleContext";
import { modulesManager } from "./modulesManager";

const DISABLED_MODULES: WeakSet<Function> = new WeakSet();

/**
 * Marks a module class as disabled, preventing its instances from being loaded.
 *
 * Disabled modules cannot be loaded manually or automatically through
 * the ModulesManager.
 *
 * @param constructor - The module class to disable.
 * @returns The original module class.
 */
export function Disabled<T extends { new(...args: any[]): {} }>(
    constructor: T
): T {
    DISABLED_MODULES.add(constructor);
    return constructor;
}

export type ModuleConstructor = new (...args: any[]) => BaseModule;

/**
 * Base class for all modules managed by the ModulesManager.
 *
 * Provides methods for controlling the module lifecycle and methods that
 * can be overridden to implement module-specific behavior.
 *
 * Public lifecycle methods delegate their operations to the ModulesManager.
 * The corresponding on-prefixed methods are called by the ModulesManager.
 *
 * Classes decorated with @Disabled are prevented from being loaded.
 */
export abstract class BaseModule {
    /**
     * Indicates whether this module is allowed to be loaded.
     *
     * Returns false if the module class has been decorated with @Disabled.
     */
    public get enabled(): boolean {
        return !DISABLED_MODULES.has(this.constructor);
    }

    /**
     * Requests initialization of this module through the ModulesManager.
     *
     * Calls onInit() once, before the module's first successful load.
     */
    protected init(): void {
        modulesManager.init(this.constructor.name);
    }

    /**
     * Requests loading of this module through the ModulesManager.
     *
     * The manager creates a ModuleContext and passes it to onLoad().
     */
    protected load(): void {
        modulesManager.load(this.constructor.name);
    }

    /**
     * Requests unloading of this module through the ModulesManager.
     *
     * The manager calls onUnload() and disposes the module's ModuleContext.
     */
    protected unload(): void {
        modulesManager.unload(this.constructor.name);
    }

    /**
     * Requests a safeword event for this module through the ModulesManager.
     *
     * The manager calls onSafeword() if the module is currently loaded.
     */
    protected safeword(): void {
        modulesManager.safeword(this.constructor.name);
    }

    /**
     * Requests reloading of this module through the ModulesManager.
     *
     * The manager unloads the module, calls onReload(), and loads it again.
     */
    protected reload(): void {
        modulesManager.reload(this.constructor.name);
    }

    /**
     * Initializes the module before its first load.
     *
     * Called only once by the ModulesManager.
     * Use this method to prepare resources and register persistent event listeners
     * required by the module.
     */
    public onInit(): void { }

    /**
     * Loads the module and activates its functionality.
     *
     * Called whenever the module is loaded.
     * Use this method to enable features, register temporary event listeners,
     * and initialize resources that should remain active only while the module
     * is loaded.
     *
     * @param context - The ModuleContext used to register hooks and patches.
     */
    public onLoad(context: ModuleContext): void { }

    /**
     * Unloads the module and deactivates its functionality.
     *
     * Called when the module is unloaded.
     * Use this method to perform module-specific cleanup before the
     * ModuleContext is disposed.
     */
    public onUnload(): void { }

    /**
     * Handles a safeword event for the module.
     *
     * Called by the ModulesManager when a safeword event is dispatched
     * to this module.
     * Use this method to immediately stop or safely terminate active
     * module functionality.
     */
    public onSafeword(): void { }

    /**
     * Performs module-specific reload operations.
     *
     * Called by the ModulesManager after onUnload() and before onLoad()
     * during a reload operation.
     * Use this method to refresh configuration, recreate resources,
     * or reset internal state.
     */
    public onReload(): void { }
}
