import bcrypt from 'bcrypt';

let senha = process.argv[2];
if (!senha) {
  senha = Math.random().toString(36).slice(-8);
  console.log('Senha simples gerada:', senha);
}

bcrypt.hash(senha, 10).then((hash) => {
  console.log('Hash gerado:');
  console.log(hash);
  process.exit(0);
});
