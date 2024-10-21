declare namespace Express {
  export interface Request {
    user?: {
      userId?: string; // Make userId optional
      roles?: UserRole[];
      accessLevel?: string;
    };
  }
}
