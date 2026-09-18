'use client';

/**
 * Ranking com barra de filtros · usado por Criativos, Públicos e Campanhas.
 *
 * Concentra ordenação, busca, seleção e paginação num só lugar para que as três
 * abas tenham exatamente o mesmo comportamento — era isso que o mockup fazia
 * com `data-scope` e um único handler de sort.
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALERTA_INFO,
  fmtMetrica,
  fmtMoeda,
  fmtNum,
  fmtPct,
  ordenar,
  SORT_LABELS,
  type Alerta,
  type Metricas,
  type SortKey,
} from '@/lib/intel';

export interface SortSection {
  titulo: string;
  chaves: SortKey[];
}

/**
 * Acima disto a lista pagina.
 *
 * Critério de pronto da fase: "paginação acima de 100 linhas". 50 por página
 * mantém o DOM leve — com 130 criativos × 8 caixas de métrica cada, renderizar
 * tudo de uma vez é o que fazia a aba passar de 2s.
 */
const POR_PAGINA = 50;
const LIMITE_SEM_PAGINACAO = 100;

interface RankingViewProps {
  itens: Metricas[];
  sortSections: SortSection[];
  sortInicial: SortKey;
  placeholderBusca: string;
  substantivo: { singular: string; plural: string };
  /** Filtros de alerta/status/formato (aba Criativos). */
  filtrosAvancados?: boolean;
  /** Conteúdo extra por item — usado no drill-down da aba Campanhas. */
  renderDetalhe?: (item: Metricas) => React.ReactNode;
  onSortChange?: (key: SortKey) => void;
  /** Seleção alimenta a action toolbar (Fase 2b). */
  onSelecionar?: (item: Metricas | null) => void;
  selecionadoId?: string | null;
}

export function RankingView({
  itens,
  sortSections,
  sortInicial,
  placeholderBusca,
  substantivo,
  filtrosAvancados = false,
  renderDetalhe,
  onSortChange,
  onSelecionar,
  selecionadoId = null,
}: RankingViewProps) {
  const [sort, setSort] = useState<SortKey>(sortInicial);
  const [busca, setBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const [avancadosAbertos, setAvancadosAbertos] = useState(false);
  const [alerta, setAlerta] = useState<Alerta | 'all'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formato, setFormato] = useState<'all' | 'Vídeo' | 'Imagem'>('all');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);

  const filtrosAtivos =
    (alerta !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0) + (formato !== 'all' ? 1 : 0);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = itens.filter((i) => {
      if (alerta !== 'all' && i.alerta !== alerta) return false;
      if (status !== 'all' && i.status !== status) return false;
      if (formato !== 'all' && i.formato !== formato) return false;
      if (termo) {
        const alvo = [i.nome, ...(i.campanhas ?? []), ...(i.publicos ?? [])]
          .join(' ')
          .toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
    return ordenar(filtrados, sort);
  }, [itens, busca, alerta, status, formato, sort]);

  // Mudar filtro ou ordenação com a página 3 aberta deixaria o gestor olhando
  // pro fim de uma lista que ele acabou de trocar.
  useEffect(() => {
    setPagina(0);
  }, [busca, alerta, status, formato, sort]);

  const paginado = visiveis.length > LIMITE_SEM_PAGINACAO;
  const totalPaginas = paginado ? Math.ceil(visiveis.length / POR_PAGINA) : 1;
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const naTela = paginado
    ? visiveis.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA)
    : visiveis;

  function escolherSort(key: SortKey) {
    setSort(key);
    setMenuAberto(false);
    onSortChange?.(key);
  }

  function aoClicar(item: Metricas) {
    if (onSelecionar) onSelecionar(selecionadoId === item.id ? null : item);
    if (renderDetalhe) setExpandido((atual) => (atual === item.id ? null : item.id));
  }

  return (
    <div className="space-y-3">
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-stretch gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            className="h-full flex items-center gap-3 px-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg hover:border-navy/40 transition"
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
                Ordenar por
              </span>
              <span className="text-xs font-extrabold">{SORT_LABELS[sort]}</span>
            </span>
            <ChevronDown size={14} className="text-[rgb(var(--muted))]" />
          </button>

          {menuAberto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
              <div className="absolute z-20 mt-1 w-60 max-h-80 overflow-y-auto bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-1">
                {sortSections.map((sec) => (
                  <div key={sec.titulo}>
                    <div className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
                      {sec.titulo}
                    </div>
                    {sec.chaves.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => escolherSort(k)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 rounded text-xs transition',
                          k === sort
                            ? 'bg-navy text-white font-bold'
                            : 'hover:bg-[rgb(var(--border))]',
                        )}
                      >
                        {SORT_LABELS[k]}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={placeholderBusca}
            className="w-full h-full pl-9 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-navy/50"
          />
        </div>

        {filtrosAvancados && (
          <button
            type="button"
            onClick={() => setAvancadosAbertos((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition',
              avancadosAbertos || filtrosAtivos > 0
                ? 'bg-navy text-white border-navy'
                : 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] hover:border-navy/40',
            )}
          >
            <SlidersHorizontal size={14} />
            Filtros
            <span
              className={cn(
                'px-1.5 rounded-full text-[10px]',
                filtrosAtivos > 0 ? 'bg-white/25' : 'bg-[rgb(var(--border))]',
              )}
            >
              {filtrosAtivos}
            </span>
          </button>
        )}
      </div>

      {filtrosAvancados && avancadosAbertos && (
        <div className="card flex flex-wrap gap-6 py-3">
          <PillGroup
            label="Alerta"
            valor={alerta}
            onChange={(v) => setAlerta(v as Alerta | 'all')}
            opcoes={[
              { valor: 'all', label: 'Todos' },
              { valor: 'escalar', label: '🚀 Escalar' },
              { valor: 'ok', label: '🟢 Saudável' },
              { valor: 'atencao', label: '🟡 Atenção' },
              { valor: 'cortar', label: '🔴 Cortar' },
            ]}
          />
          <PillGroup
            label="Status"
            valor={status}
            onChange={(v) => setStatus(v as 'all' | 'active' | 'inactive')}
            opcoes={[
              { valor: 'all', label: 'Todos' },
              { valor: 'active', label: 'Ativos' },
              { valor: 'inactive', label: 'Inativos' },
            ]}
          />
          <PillGroup
            label="Formato"
            valor={formato}
            onChange={(v) => setFormato(v as 'all' | 'Vídeo' | 'Imagem')}
            opcoes={[
              { valor: 'all', label: 'Todos' },
              { valor: 'Vídeo', label: 'Vídeo' },
              { valor: 'Imagem', label: 'Imagem' },
            ]}
          />
        </div>
      )}

      <p className="text-[11px] text-[rgb(var(--muted))] font-bold">
        {visiveis.length === itens.length
          ? `${itens.length} ${itens.length === 1 ? substantivo.singular : substantivo.plural}`
          : `${visiveis.length} de ${itens.length} ${substantivo.plural}`}{' '}
        · ordenado por {SORT_LABELS[sort]}
        {paginado && ` · página ${paginaAtual + 1} de ${totalPaginas}`}
      </p>

      {visiveis.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-[rgb(var(--muted))]">
            Nenhum resultado para os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {naTela.map((item, i) => (
            <RankingCard
              key={item.id}
              posicao={paginaAtual * POR_PAGINA + i + 1}
              item={item}
              destaque={sort}
              clicavel={Boolean(renderDetalhe || onSelecionar)}
              selecionado={selecionadoId === item.id}
              expandido={expandido === item.id}
              onClick={() => aoClicar(item)}
              detalhe={renderDetalhe?.(item)}
            />
          ))}
        </div>
      )}

      {paginado && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <BotaoPagina
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            desabilitado={paginaAtual === 0}
          >
            <ChevronLeft size={14} />
            Anterior
          </BotaoPagina>
          <span className="text-[11px] text-[rgb(var(--muted))] font-bold tabular-nums px-2">
            {paginaAtual + 1} / {totalPaginas}
          </span>
          <BotaoPagina
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            desabilitado={paginaAtual >= totalPaginas - 1}
          >
            Próxima
            <ChevronRight size={14} />
          </BotaoPagina>
        </div>
      )}
    </div>
  );
}

function BotaoPagina({
  onClick,
  desabilitado,
  children,
}: {
  onClick: () => void;
  desabilitado: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition',
        desabilitado
          ? 'border-[rgb(var(--border))] text-[rgb(var(--muted))] opacity-50 cursor-not-allowed'
          : 'border-[rgb(var(--border))] hover:border-navy/40',
      )}
    >
      {children}
    </button>
  );
}

function PillGroup({
  label,
  valor,
  onChange,
  opcoes,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: Array<{ valor: string; label: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-bold border transition',
              valor === o.valor
                ? 'bg-navy text-white border-navy'
                : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RankingCard({
  posicao,
  item,
  destaque,
  clicavel,
  selecionado,
  expandido,
  onClick,
  detalhe,
}: {
  posicao: number;
  item: Metricas;
  destaque: SortKey;
  clicavel: boolean;
  selecionado: boolean;
  expandido: boolean;
  onClick: () => void;
  detalhe?: React.ReactNode;
}) {
  const info = ALERTA_INFO[item.alerta];

  const metricas: Array<{ label: string; valor: string; chave: SortKey }> = [
    { label: 'Investido', valor: fmtMoeda(item.spend, 0), chave: 'spend' },
    { label: 'Leads', valor: fmtNum(item.leads), chave: 'leads' },
    { label: 'MQLs', valor: fmtNum(item.mqls), chave: 'mqls' },
    { label: 'Agend.', valor: fmtNum(item.agend), chave: 'agend' },
    { label: 'CPL', valor: fmtMoeda(item.cpl), chave: 'cpl' },
    { label: 'CPMQL', valor: fmtMoeda(item.cpmql), chave: 'cpmql' },
    { label: 'Conv L→M', valor: fmtPct(item.convLm), chave: 'conv_lm' },
    { label: 'CTR', valor: fmtPct(item.ctr, 2), chave: 'ctr' },
  ];

  // Se a ordenação for por uma métrica de projeção, mostra ela no lugar do CTR.
  const projecoes: SortKey[] = ['reunioes', 'vendas', 'receita', 'cac', 'roas', 'ltv'];
  if (projecoes.includes(destaque)) {
    metricas[7] = {
      label: SORT_LABELS[destaque].replace(' ↓', ''),
      valor: fmtMetrica(item, destaque),
      chave: destaque,
    };
  }

  return (
    <article
      className={cn(
        'card p-0 overflow-hidden transition',
        selecionado && 'ring-2 ring-navy border-navy',
      )}
    >
      <div
        className={cn('p-3', clicavel && 'cursor-pointer hover:bg-[rgb(var(--border))]/30 transition')}
        onClick={clicavel ? onClick : undefined}
      >
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 shrink-0 rounded bg-[rgb(var(--border))] flex items-center justify-center text-[10px] font-extrabold text-[rgb(var(--muted))]">
            {posicao}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold truncate" title={item.nome}>
                {item.nome}
              </h3>
              <span className={cn('px-1.5 py-0.5 rounded border text-[9px] font-bold', info.classe)}>
                {info.icone} {info.label}
              </span>
              {item.formato && (
                <span className="px-1.5 py-0.5 rounded bg-[rgb(var(--border))] text-[9px] font-bold text-[rgb(var(--muted))]">
                  {item.formato}
                </span>
              )}
              {item.status === 'inactive' && (
                <span className="px-1.5 py-0.5 rounded bg-[rgb(var(--border))] text-[9px] font-bold text-[rgb(var(--muted))]">
                  Inativo
                </span>
              )}
            </div>
            {(item.campanhas?.length ?? 0) > 0 && (
              <p className="text-[10px] text-[rgb(var(--muted))] truncate mt-0.5">
                {item.campanhas!.length === 1
                  ? item.campanhas![0]
                  : `${item.campanhas!.length} campanhas · ${item.publicos?.length ?? 0} públicos`}
              </p>
            )}
          </div>

          {detalhe !== undefined && (
            <ChevronDown
              size={16}
              className={cn(
                'shrink-0 text-[rgb(var(--muted))] transition',
                expandido && 'rotate-180',
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mt-3">
          {metricas.map((m) => (
            <div
              key={m.label}
              className={cn(
                'rounded px-2 py-1.5',
                m.chave === destaque ? 'bg-navy/10 ring-1 ring-navy/25' : 'bg-[rgb(var(--border))]/40',
              )}
            >
              <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
                {m.label}
              </div>
              <div className="text-xs font-extrabold tabular-nums mt-0.5">{m.valor}</div>
            </div>
          ))}
        </div>
      </div>

      {expandido && detalhe && (
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">{detalhe}</div>
      )}
    </article>
  );
}
