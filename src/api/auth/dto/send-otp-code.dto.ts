import { IsEnum, IsNotEmpty } from "class-validator";
import { OtpTypeEnum } from "src/common/database/Enums";
import { IsPhoneNumber } from "src/common/decorator/is-phone-number";
import { ApiProperty } from "@nestjs/swagger";

export class SendOtpCodeDto {
	@ApiProperty({
		example: "+998991234567",
	})
	@IsNotEmpty()
	@IsPhoneNumber()
	public phoneNumber!: string;

	@ApiProperty({
		example: OtpTypeEnum.DOCTOR,
		description: "type doctor yoki patient",
	})
	@IsNotEmpty()
	@IsEnum(OtpTypeEnum)
	public type!: OtpTypeEnum;
}
