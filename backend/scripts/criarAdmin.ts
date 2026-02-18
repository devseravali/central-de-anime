import '../src/config/env';
import { usuariosRepositorio } from '../src/repositories/usuariosRepositorio';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';

async function main() {
  const nome = 'Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@centralanime.com';
  const senha = process.env.ADMIN_PASSWORD || 'Admin@123';

  // Verifica se já existe
  const existente = await usuariosRepositorio.buscarPorEmail(email);
  if (existente) {
    console.log('Já existe um admin com esse e-mail.');
    process.exit(0);
  }

  const usuario = await usuariosRepositorio.criar({ nome, email, senha });
  await adminAuthRepositorio.garantirAdmin(usuario.id);

  console.log('Admin criado com sucesso:', { id: usuario.id, email });
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro ao criar admin:', err);
  process.exit(1);
});
