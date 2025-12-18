import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ScanQrDto {
	@ApiProperty()
	@IsNotEmpty()
	public qrData!: string;
}
