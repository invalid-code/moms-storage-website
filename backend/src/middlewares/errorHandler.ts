import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (err instanceof Error) {
        return res.status(500).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
};