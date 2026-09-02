import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

type ValidationSchemas = {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
};

export const validationMiddleware = (
    schemas: ValidationSchemas
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const errors: {
            field: string;
            message: string;
        }[] = [];

        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);

            if (!result.success) {
                errors.push(
                    ...result.error.issues.map((issue) => ({
                        field: `body.${issue.path.join('.')}`,
                        message: issue.message,
                    }))
                );
            } else {
                req.body = result.data;
            }
        }

        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);

            if (!result.success) {
                errors.push(
                    ...result.error.issues.map((issue) => ({
                        field: `params.${issue.path.join('.')}`,
                        message: issue.message,
                    }))
                );
            } else {
                Object.assign(req.params, result.data);
            }
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);

            if (!result.success) {
                errors.push(
                    ...result.error.issues.map((issue) => ({
                        field: `query.${issue.path.join('.')}`,
                        message: issue.message,
                    }))
                );
            } else {
                Object.assign(req.query, result.data);
            }
        }

        if (errors.length > 0) {
            res.status(400).json({
                message: 'Dados de entrada inválidos',
                errors,
            });

            return;
        }

        next();
    };
};