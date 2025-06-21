import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { CreateUserDto, LoginDto } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: Request<{}, {}, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const result = await SupabaseAuthService.register(req.body);
      
      res.status(201).json({
        status: 'success',
        data: {
          user: result.user,
          session: result.session,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request<{}, {}, LoginDto>, res: Response, next: NextFunction) {
    try {
      const result = await SupabaseAuthService.login(req.body);
      
      res.json({
        status: 'success',
        data: {
          user: result.user,
          session: result.session,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          status: 'error',
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await SupabaseAuthService.refreshSession(refreshToken);
      
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await SupabaseAuthService.logout();

      res.json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Verification token is required',
        });
        return;
      }

      await SupabaseAuthService.verifyEmail(token);
      
      res.json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          status: 'error',
          message: 'Email is required',
        });
        return;
      }

      await SupabaseAuthService.resetPassword(email);
      
      res.json({
        status: 'success',
        message: 'Password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  }
}