import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { expressjwt } from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwtMiddleware = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksUri: `https://dev-saoey73oawm3uyg7.us.auth0.com/.well-known/jwks.json`,
    }) as any,
    audience: "https://dev-saoey73oawm3uyg7.us.auth0.com/api/v2/",
    issuer: `https://dev-saoey73oawm3uyg7.us.auth0.com/`,
    algorithms: ["RS256"],
  });

  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    return new Promise((resolve, reject) => {
      this.jwtMiddleware(req, res, (err: any) => {
        if (err) {
          reject(new UnauthorizedException("Invalid token"));
        } else {
          resolve(true);
        }
      });
    });
  }
}
