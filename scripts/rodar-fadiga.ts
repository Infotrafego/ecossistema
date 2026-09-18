/**
 * Recalcula a fadiga criativa de todos os clientes.
 * Normalmente roda junto com o sync (lib/meta-ads/agendador.ts); este script
 * existe pra disparar fora do ciclo.
 *
 *   node scripts/run.cjs scripts/rodar-fadiga.ts
 */

import { recalcularFadigaTodos } from '@/lib/data/fadiga';

const i = process.argv.indexOf('--dias');
const dias = i >= 0 ? Number(process.argv[i + 1]) : undefined;

recalcularFadigaTodos(dias)
  .then((resultados) => {
    for (const r of resultados) {
      console.log(
        r.erro
          ? `cliente ${r.clientId}: ERRO ${r.erro}`
          : `cliente ${r.clientId}: ${r.criativosAvaliados} avaliados · ` +
            `${r.criticos} críticos · ${r.atencao} atenção`,
      );
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
