import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthorizationError } from "../exception";
import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest<T = any>(error: unknown, user: T, info: any, context: ExecutionContext): T {
		if (error || !user) {
			throw error || new HttpException(errorPrompt.authorizationError, 401);
		}

		return user;
	}
}
