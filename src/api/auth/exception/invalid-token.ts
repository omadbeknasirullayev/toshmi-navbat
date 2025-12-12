import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class InvalidToken extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "invalid_token")), 400);
	}
}
