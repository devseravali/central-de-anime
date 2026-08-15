import type { Request, Response, NextFunction } from 'express';

export const paginationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
        Math.max(Number(req.query.limit) || 10, 1),
        100
    );

    const offset = (page - 1) * limit;

    req.pagination = {
        page,
        limit,
        offset
    };

    next();
};