import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "../../prompts/errorPrompt";

export class FileRequiredException extends HttpException {
	constructor() {
		super("file required", 400);
	}
}

export class FileNotFoundException extends HttpException {
	constructor() {
		super("file not found", 404);
	}
}

export class ErrorCreatingFile extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "error_create_file")), 400);
	}
}

export class ErrorDeletingFile extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "error_delete_file")), 400);
	}
}
