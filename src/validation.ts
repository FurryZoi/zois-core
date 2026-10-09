import { plainToInstance } from "class-transformer";
import { registerDecorator, validate, ValidationArguments, ValidationOptions } from "class-validator";

export * from "class-validator";
export * from "class-transformer";

export async function validateData(data: any, dtoClass: any): Promise<{
    isValid: boolean;
    validatedData?: any;
    errors?: string[];
}> {
    try {
        const dtoInstance = plainToInstance(dtoClass, data);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
            const errorMessages = errors.flatMap((error) =>
                Object.values(error.constraints || {})
            );

            return {
                isValid: false,
                errors: errorMessages
            };
        }

        return {
            isValid: true,
            validatedData: dtoInstance
        };

    } catch (error) {
        return {
            isValid: false,
            errors: ["Validation error: " + (error as Error).message]
        };
    }
}

export function ValidateWith<T extends object>(validator: (object: T) => boolean, validationOptions?: ValidationOptions) {
    return (object: T, propertyName: string) => {
        registerDecorator({
            name: "validateCustom",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return validator(args.object as T);
                },
                defaultMessage(args: ValidationArguments) {
                    return "Params error";
                }
            },
        });
    };
}

export function IsMemberNumber(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isMemberNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    return (
                        typeof value === "number" &&
                        Number.isInteger(value) &&
                        value > 0 &&
                        Number.isFinite(value)
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `Property "${args.property}" with value "${args.value}" is not valid member number`;
                }
            },
        });
    };
}

export function IsAssetGroupName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isAssetGroupName",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    const g = AssetGroupGet("Female3DCG", value as AssetGroupName);
                    return !!g;
                },
                defaultMessage(args: ValidationArguments) {
                    return `Property "${args.property}" with value "${args.value}" is not valid asset group name`;
                }
            },
        });
    };
}


export function IsAssetGroupItemName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isAssetGroupItemName",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    const g = AssetGroupGet("Female3DCG", value as AssetGroupItemName);
                    return !!g && g.IsItem();
                },
                defaultMessage(args: ValidationArguments) {
                    return `Property "${args.property}" with value "${args.value}" is not valid asset group item name`;
                }
            },
        });
    };
}
