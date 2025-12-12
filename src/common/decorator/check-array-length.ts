import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function MinArrayLength(minLength: number, validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			name: "minArrayLength",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [minLength],
			options: validationOptions,
			validator: {
				validate(value: any[], args: ValidationArguments) {
					return value?.length >= args.constraints[0];
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} must contain at least ${args.constraints[0]} items`;
				},
			},
		});
	};
}
