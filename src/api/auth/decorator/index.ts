import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import { Cookies } from '../enums/cookie.enum';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorator to extract JWT token from either cookie or Authorization header
 * Priority: Cookie first, then Bearer token from Authorization header
 */
export const GetToken = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): string | null => {
		const request = ctx.switchToHttp().getRequest<Request>();

		// Try to extract from cookie first
		const tokenFromCookie = request?.cookies?.[Cookies.ACCESS_TOKEN];
		if (tokenFromCookie) {
			return tokenFromCookie;
		}

		// Fallback to bearer token from authorization header
		const authHeader = request.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7);
		}

		return null;
	},
);
