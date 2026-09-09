import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Request failed', {
        method: req.method,
        url: req.originalUrl,
        error: err instanceof Error ? (err.stack ?? err.message) : String(err),
    });
    if (err instanceof Error) {
        return res.status(500).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
};