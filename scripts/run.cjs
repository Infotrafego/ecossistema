/**
 * Runner das verificações e scripts operacionais em TypeScript.
 *
 * O projeto não tem test runner (nem deve ter: cada dependência nova é custo
 * de build). jiti já vem junto com o Next, roda .ts direto e aceita o alias
 * `@/` do tsconfig — o suficiente pra executar a lógica pura de verdade em vez
 * de afirmar que ela funciona.
 *
 *   node scripts/run.cjs scripts/verificar/nucleo.ts
 */
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');

/**
 * Carrega o .env manualmente.
 *
 * O Next faz isso sozinho em `next dev`/`next build`, mas um script solto roda
 * fora dele. Parser mínimo de propósito: adicionar `dotenv` só pra isso seria
 * uma dependência nova num projeto que evita justamente isso.
 */
function carregarEnv() {
  const LINHA = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

  for (const arquivo of ['.env', '.env.local']) {
    const caminho = path.join(raiz, arquivo);
    if (!fs.existsSync(caminho)) continue;

    for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
      const m = LINHA.exec(linha.replace(/\r$/, ''));
      if (!m) continue;
      const valor = m[2].trim().replace(/^["']|["']$/g, '');
      // .env.local vence .env, e o ambiente vence os dois.
      if (process.env[m[1]] === undefined || arquivo === '.env.local') {
        process.env[m[1]] = valor;
      }
    }
  }
}

carregarEnv();

const jiti = require('jiti')(__filename, {
  alias: { '@': raiz },
  esmResolve: true,
  interopDefault: true,
});

const alvo = process.argv[2];
if (!alvo) {
  console.error('uso: node scripts/run.cjs <arquivo.ts> [args...]');
  process.exit(1);
}

jiti(path.resolve(raiz, alvo));
