import { IsEnum, IsNotEmpty } from "class-validator";
import { OtpTypeEnum } from "src/common/database/Enums";
import { IsPhoneNumber } from "src/common/decorator/is-phone-number";
import { ApiProperty } from "@nestjs/swagger";

export class VerifySmsCodeDto {
	@ApiProperty({
		example: "+998991234567",
	})
	@IsNotEmpty()
	@IsPhoneNumber()
	public phoneNumber!: string;

	@ApiProperty({
		example: "1234",
	})
	@IsNotEmpty()
	public code!: string;

	@ApiProperty({
		example: OtpTypeEnum.DOCTOR,
	})
	@IsNotEmpty()
	@IsEnum(OtpTypeEnum)
	public type!: OtpTypeEnum;
}
