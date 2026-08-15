import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validationMiddleware = (schema: ZodType) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            res.status(400).json({
                message: 'Dados de entrada inválidos',
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });

            return;
        }

        next();
    };
};