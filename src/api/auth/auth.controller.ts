import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";
import { CookieOptionals, Cookies } from "./enums/cookie.enum";
import { StudentLoginDto } from "./dto/student-login.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("admin-login")
	async adminLogin(@Body() dto: LoginDto, @Res() res: Response) {
		const data = await this.authService.adminLogin(dto);
		res.cookie(Cookies.ACCESS_TOKEN, data.token, CookieOptionals);
		res.json({
			status: true,
			statusCode: 200,
			error: null,
			timestamp: new Date().toISOString(),
			path: "/api/auth/admin-login",
			data,
		});
	}

	@Post("student-login")
	async studentLogin(@Body() dto: StudentLoginDto, @Res() res: Response) {
		const data = await this.authService.studentLogin(dto);
		res.cookie(Cookies.ACCESS_TOKEN, data.token, CookieOptionals);
		res.json({
			status: true,
			statusCode: 200,
			error: null,
			timestamp: new Date().toISOString(),
			path: "/api/auth/student-login",
			data,
		});
	}
}
