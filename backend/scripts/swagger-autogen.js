import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { swaggerSpec } from '../src/config/swagger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..');

const outputFile = path.resolve(
    backendRoot,
    'swagger-output.json'
);

const run = async () => {
    try {
        await writeFile(
            outputFile,
            JSON.stringify(swaggerSpec, null, 2),
            'utf8'
        );

        console.log('Swagger gerado em:', outputFile);
        console.log(
            'Total de rotas documentadas:',
            Object.keys(swaggerSpec.paths ?? {}).length
        );
    } catch (error) {
        console.error('Erro ao gerar Swagger:', error);
        process.exit(1);
    }
};

run();