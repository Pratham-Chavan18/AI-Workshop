import { Request, Response, NextFunction } from 'express';
import { registerStudent } from '../services/registration.service';

export const registerStudentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerStudent(req.body);
    res.status(201).json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};
