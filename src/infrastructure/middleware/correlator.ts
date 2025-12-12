import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import correlator from "../lib/correlator";

@Injectable()
export class CorrelatorMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		try {
			correlator.bindEmitter(req);
			correlator.bindEmitter(res);
			correlator.bindEmitter(req.socket);

			correlator.withId(
				() => {
					const currentCorrelationId = correlator.getId();
					res.set("x-correlation-id", currentCorrelationId);
					next();
				},
				req.get("x-correlation-id") as string,
			);
		} catch (error) {
			res.sendStatus(500);
		}
	}
}
