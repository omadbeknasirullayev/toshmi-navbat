import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RolesEnum } from "src/common/database/Enums";
import { appConfig } from "src/config/app.config";

@Injectable()
export class JwtToken {
	constructor(private readonly jwt: JwtService) {}

	public async generateToken(
		user: any,
		role: RolesEnum
	): Promise<string> {
		const payload = {
			id: user.id,
			role: role
		};

		// const [access_token, refresh_token] = await Promise.all([
		// 	this.jwt.signAsync(payload, {
		// 		// secret: appConfig.ACCESS_SECRET_KEY,
		// 		// expiresIn: appConfig.ACCESS_SECRET_TIME
		// 	}),

		// 	this.jwt.signAsync(payload, {
		// 		// secret: appConfig.REFRESH_SECRET_KEY,
		// 		// expiresIn: appConfig.REFRESH_SECRET_TIME,
		// 	}),
		// ]);

		const token = await this.jwt.signAsync(payload, {
		  secret: appConfig.TOKEN_KEY,
		  expiresIn: appConfig.TOKEN_EXPIRE,
		});

		return token;
	}

	public async verifyAccess(token: string) {
		// return this.jwt.verifyAsync(token, { publicKey: appConfig.ACCESS_SECRET_KEY });
	}

	public async verifyRefresh(token: string) {
		// return this.jwt.verifyAsync(token, { publicKey: appConfig.REFRESH_SECRET_KEY });
	}
}
