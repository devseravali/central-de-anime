import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import appRoutes from './app';

const app = express();

app.use(cors());

app.use(express.json());

app.use(appRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
