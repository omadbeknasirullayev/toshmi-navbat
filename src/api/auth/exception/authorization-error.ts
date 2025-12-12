import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class AuthorizationError extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "authorization_error")), 401);
	}
}
