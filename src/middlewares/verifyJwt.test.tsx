import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyJWT } from './verifyJwt';

describe('verifyJWT middleware', () => {
  it('should call next() if the token is valid', () => {
    // Mocking a valid token
    const validToken = jwt.sign({ UserInfo: { username: 'testuser' } }, 'your-secret-key');

    // Mocking request and response objects
    const req: Request | any = { headers: { authorization: `Bearer ${validToken}` } } as Request;
    const res: Response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next: NextFunction = jest.fn();

    // Calling the middleware
    verifyJWT(req, res, next);

    // Expectations
    expect(req.user).toEqual('testuser');
  });

  it('should return 401 if there is no Bearer token', () => {
    // Mocking request and response objects
    const req: Request = { headers: {} } as Request;
    const res: Response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next: NextFunction = jest.fn();

    // Calling the middleware
    verifyJWT(req, res, next);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if the token is invalid', () => {
    // Mocking an invalid token
    const invalidToken = 'invalid-token';

    // Mocking request and response objects
    const req: Request = { headers: { authorization: `Bearer ${invalidToken}` } } as Request;
    const res: Response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next: NextFunction = jest.fn();

    // Calling the middleware
    verifyJWT(req, res, next);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
});
