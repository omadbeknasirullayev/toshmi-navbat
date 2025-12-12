import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class CannotDoAction extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "cannot_do_action")), 404);
	}
}
