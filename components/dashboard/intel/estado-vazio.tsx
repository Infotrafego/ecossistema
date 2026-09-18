/**
 * Estados vazios das abas.
 *
 * Existe porque, com dados reais, "nada na tela" tem várias causas diferentes e
 * o gestor precisa saber qual é a dele: não há cliente, não há conta Meta
 * ligada, o sync nunca rodou, ou o período escolhido não teve entrega. Um
 * "sem dados" genérico faria todo mundo abrir chamado.
 */

import Link from 'next/link';

type Motivo = 'sem_acesso' | 'sem_conta_meta' | 'sem_sync' | 'periodo_vazio';

const MENSAGENS: Record<Motivo, { titulo: string; texto: string; acao?: { label: string; href: string } }> = {
  sem_acesso: {
    titulo: 'Nenhum cliente disponível',
    texto:
      'Sua conta não está associada a nenhum cliente. Peça a um admin pra incluir você em client_members.',
  },
  sem_conta_meta: {
    titulo: 'Conta de anúncios não configurada',
    texto:
      'Este cliente ainda não tem o ID da conta Meta preenchido (clients.meta_ad_account_id), então não há o que sincronizar.',
  },
  sem_sync: {
    titulo: 'O sync ainda não rodou',
    texto:
      'A conta está configurada, mas nenhuma métrica foi importada da Meta até agora. Rode o sync pra popular o período.',
    acao: { label: 'Ver status do sync', href: '/dashboard/inteligencia-de-dados/sync' },
  },
  periodo_vazio: {
    titulo: 'Sem entrega no período',
    texto: 'Não houve impressão nem investimento no recorte selecionado. Experimente ampliar o período.',
  },
};

export function EstadoVazio({ motivo }: { motivo: Motivo }) {
  const { titulo, texto, acao } = MENSAGENS[motivo];

  return (
    <div className="card text-center py-12 px-6">
      <div className="text-2xl text-[rgb(var(--muted))]">◌</div>
      <h2 className="text-sm font-extrabold tracking-tight mt-2">{titulo}</h2>
      <p className="text-[12px] text-[rgb(var(--muted))] mt-1.5 max-w-md mx-auto">{texto}</p>
      {acao && (
        <Link
          href={acao.href}
          className="inline-block mt-4 px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition"
        >
          {acao.label}
        </Link>
      )}
    </div>
  );
}

/**
 * Escolhe o motivo a partir do contexto. Centralizado pra que as 5 abas contem
 * a mesma história — antes cada tela inventaria a sua.
 */
export function motivoDoVazio(ctx: {
  semAcesso: boolean;
  contaMeta: string | null | undefined;
  houveSync: boolean;
}): Motivo {
  if (ctx.semAcesso) return 'sem_acesso';
  if (!ctx.contaMeta || ctx.contaMeta.includes('PREENCHER')) return 'sem_conta_meta';
  if (!ctx.houveSync) return 'sem_sync';
  return 'periodo_vazio';
}
