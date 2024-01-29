// verifyJwt.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { GetPublicKeyOrSecret, Secret, VerifyErrors } from 'jsonwebtoken';

const verifyJWT = (
  req: Request | any,
  res: Response | any,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization || (req.headers.Authorization as any);

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret | GetPublicKeyOrSecret,
    (err: VerifyErrors | null, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });

      req.user = decoded?.UserInfo?.username; // Ensure decoded has the expected structure
      req.roles = decoded?.UserInfo?.roles;
      next();
    }
  );
};

export { verifyJWT };
