// src/common/decorator/current-user.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ICurrentuser } from "src/common/interface/current-user.interface";

export const CurrentUserWs = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): ICurrentuser | undefined => {
		// Agar kontekst WebSocket bo'lsa (Gatewaylar uchun)
		const client = ctx.switchToWs().getClient();
		// Biz 'user'ni handleConnection'da 'client'ga biriktirgan bo'lamiz
		return (client as any).user as ICurrentuser;

	},
);
