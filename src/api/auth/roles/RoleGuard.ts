import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from 'src/common/database/Enums';
import { AuthPayload } from 'src/common/type';
import { errorPrompt } from 'src/infrastructure/lib/prompts/errorPrompt';
import { IS_PUBLIC_KEY } from './RolesDecorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes without authentication
    }

    if (!roles) {
      return true;
    }

    const request: Express.Request = context.switchToHttp().getRequest();
    const user = request.user as AuthPayload;

    if (!roles.includes(user.role)) {
      throw new HttpException(errorPrompt.notPermissionError, 403);
    }

    return true;
  }
}
