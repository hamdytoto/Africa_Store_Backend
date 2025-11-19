import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions ?? {
                message:
                    'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number',
            },
            validator: {
                validate(value: any, _args: ValidationArguments) {
                    if (typeof value !== 'string') return false;
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value);
                },
            },
        });
    };
}
