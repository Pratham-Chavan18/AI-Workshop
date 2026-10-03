import { Request, Response, NextFunction } from 'express';
import { searchColleges } from '../services/colleges.service';

export const searchCollegesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    if (!search || search.trim().length === 0) {
      res.status(200).json({ items: [] });
      return;
    }

    const items = await searchColleges(search);
    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};
