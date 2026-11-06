import { loadEnvironment } from './config/environment';

loadEnvironment();
const { default: app } = await import('./app');

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
