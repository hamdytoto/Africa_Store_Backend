import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isFutureDate',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value) return false;
                    const date = new Date(value);
                    const now = new Date();
                    return date > now; // must be in the future
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a future date`;
                },
            },
        });
    };
}
