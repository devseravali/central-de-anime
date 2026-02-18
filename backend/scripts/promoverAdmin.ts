import { db } from '../src/db';
import { usuarios } from '../src/schema/usuario';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';
  import { eq } from 'drizzle-orm';


async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: npx tsx scripts/promoverAdmin.ts email_do_usuario');
    process.exit(1);
    }
    
  const usuario = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email));
  if (!usuario[0]) {
    console.error('Usuário não encontrado:', email);
    process.exit(1);
  }
  await adminAuthRepositorio.garantirAdmin(usuario[0].id);
  console.log('Usuário promovido a admin:', email);
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro ao promover admin:', err);
  process.exit(1);
});
