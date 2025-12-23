import { ApiProperty } from "@nestjs/swagger";

export class AxiosRequestDto {
	@ApiProperty()
	public url!: string;
	@ApiProperty()
	public method!: string;
	@ApiProperty()
	public data?: any;
	@ApiProperty()
	public headers?: any;
}
