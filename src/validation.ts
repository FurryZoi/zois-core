import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

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
            errors: ['Validation error: ' + error.message]
        };
    }
}
