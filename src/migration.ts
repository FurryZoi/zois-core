
import { isVersionNewer, MOD_DATA } from ".";
import { logger } from "./logging";

export type MigratorConstructor = new () => BaseMigrator;

export abstract class BaseMigrator {
    public abstract readonly migrationVersion: string;
    public abstract migrate(): void;
}

export function runMigrations(savedVersion: string): void {
    const migrations: BaseMigrator[] = Object.values(
        MOD_DATA.migrators ?? {}
    ).map((Migrator: MigratorConstructor): BaseMigrator => new Migrator());

    migrations.sort((a, b) => {
        if (isVersionNewer(a.migrationVersion, b.migrationVersion)) {
            return 1;
        }

        if (isVersionNewer(b.migrationVersion, a.migrationVersion)) {
            return -1;
        }

        return 0;
    });

    for (const migrator of migrations) {
        if (!isVersionNewer(migrator.migrationVersion, savedVersion)) {
            continue;
        }

        if (isVersionNewer(migrator.migrationVersion, MOD_DATA.version)) {
            continue;
        }

        try {
            migrator.migrate();
            logger.log(`Applied migration to version "${migrator.migrationVersion}"`);
        } catch (error: unknown) {
            logger.error(`Failed to apply migration to version "${migrator.migrationVersion}":`, error);
            return;
        }
    }
}
