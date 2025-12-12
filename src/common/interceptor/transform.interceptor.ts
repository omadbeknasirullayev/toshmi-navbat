import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	HttpException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const path = request.url;

		return next.handle().pipe(
			// ✅ Success response’larni standart formatga solish
			map((data) => ({
				status: true,
				statusCode: data?.statusCode ?? 200,
				error: null,
				timestamp: new Date().toISOString(),
				path,
				data: data,
			})),
		);
	}
}
