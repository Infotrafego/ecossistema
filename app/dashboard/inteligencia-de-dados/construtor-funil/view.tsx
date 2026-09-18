'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Database, Loader2, Pencil, Plug, Table2 } from 'lucide-react';
import { FunilCone } from '@/components/dashboard/funil-cone';
import { montarCone } from '@/lib/cone';
import type { ClienteResumo, ErroValidacao, FunilResumo } from '@/lib/data/funis';
import {
  CAPTURAS,
  CONFIG_VAZIA,
  ETAPAS,
  FAMILIAS,
  FONTES_EXEMPLO,
  ordenarEtapas,
  reconhecer,
  SUBOBJETIVOS,
  type ConfigFunil,
  type EtapaId,
  type Familia,
  type ModoCaptura,
  type Reconhecimento,
  type SubObjetivo,
} from '@/lib/funil';
import type { LinhaBruta } from '@/lib/intel';
import { cn } from '@/lib/utils';
import { arquivarFunilAction, salvarFunilAction } from './actions';

type TipoFonte = 'sheet' | 'api' | 'db';

interface Props {
  clientes: ClienteResumo[];
  funis: FunilResumo[];
  emEdicao: ConfigFunil | null;
}

export function ConstrutorView({ clientes, funis, emEdicao }: Props) {
  const router = useRouter();
  // Editar já entra no passo 3: a inferência é pra funil novo, e reprocessá-la
  // por cima de uma config salva sobrescreveria os ajustes manuais do gestor.
  const [etapa, setEtapa] = useState<1 | 2 | 3>(emEdicao ? 3 : 1);
  const [maxEtapa, setMaxEtapa] = useState<1 | 2 | 3>(emEdicao ? 3 : 1);
  const [tipoFonte, setTipoFonte] = useState<TipoFonte>('sheet');
  const [fonte, setFonte] = useState(FONTES_EXEMPLO[0].chave);
  const [recog, setRecog] = useState<Reconhecimento | null>(null);
  const [config, setConfig] = useState<ConfigFunil>(
    emEdicao ?? { ...CONFIG_VAZIA, clientId: clientes[0]?.id, cliente: clientes[0]?.nome ?? '' },
  );
  const [erros, setErros] = useState<ErroValidacao[]>([]);
  const [salvoId, setSalvoId] = useState<string | null>(emEdicao?.id ?? null);
  const [salvando, iniciarSalvamento] = useTransition();

  function detectar() {
    const f = FONTES_EXEMPLO.find((x) => x.chave === fonte)!;
    const r = reconhecer(f.campos);
    // A fonte de exemplo traz o nome do cliente; casa com a lista real quando
    // existe, e senão mantém o primeiro — o gestor corrige no passo 3.
    const cliente = clientes.find((c) => c.nome === f.cliente) ?? clientes[0];

    setRecog(r);
    setConfig({
      clientId: cliente?.id,
      cliente: cliente?.nome ?? f.cliente,
      nome: f.nome,
      familia: r.familia,
      subObjetivo: r.subObjetivo,
      captura: r.captura,
      etapas: r.camposDetectados,
      marcadorMkt: r.marcadorMkt,
      marcadorCom: r.marcadorCom,
      metas: {},
    });
    setSalvoId(null);
    setErros([]);
    setEtapa(2);
    setMaxEtapa(3);
  }

  function salvar() {
    setErros([]);
    iniciarSalvamento(async () => {
      const resultado = await salvarFunilAction(config);
      if (resultado.ok && resultado.id) {
        setSalvoId(resultado.id);
        setConfig((c) => ({ ...c, id: resultado.id }));
        router.refresh();
      } else {
        setErros(resultado.erros ?? [{ campo: 'geral', mensagem: 'Falha ao salvar.' }]);
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {emEdicao ? 'Editar funil' : 'Construtor de Funil'}
          </h1>
          <p className="text-sm text-[rgb(var(--muted))] mt-1">
            Cadastre a configuração uma vez · cone, KPIs e tabelas renderizam sozinhos
          </p>
        </div>
        {emEdicao && (
          <button
            type="button"
            onClick={() => router.push('/dashboard/inteligencia-de-dados/construtor-funil')}
            className="px-3 py-1.5 border border-[rgb(var(--border))] rounded-lg text-[11px] font-extrabold hover:border-navy/40 transition"
          >
            + Criar outro funil
          </button>
        )}
      </header>

      <FunisCadastrados funis={funis} clientes={clientes} atual={salvoId} />

      <nav className="flex flex-wrap gap-2">
        {([
          [1, 'Conectar fonte'],
          [2, 'Reconhecimento automático'],
          [3, 'Ajustar manualmente'],
        ] as const).map(([n, label]) => {
          const habilitada = n <= maxEtapa;
          return (
            <button
              key={n}
              type="button"
              disabled={!habilitada}
              onClick={() => habilitada && setEtapa(n)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition',
                etapa === n
                  ? 'bg-navy text-white border-navy'
                  : habilitada
                    ? 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] hover:border-navy/40'
                    : 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] opacity-40 cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[9px]',
                  etapa === n ? 'bg-white/25' : 'bg-[rgb(var(--border))]',
                )}
              >
                {n}
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {etapa === 1 && (
        <PassoConectar
          tipoFonte={tipoFonte}
          setTipoFonte={setTipoFonte}
          fonte={fonte}
          setFonte={setFonte}
          onDetectar={detectar}
          onPular={() => {
            setMaxEtapa(3);
            setEtapa(3);
          }}
        />
      )}

      {etapa === 2 && recog && (
        <PassoReconhecimento
          recog={recog}
          config={config}
          onConfirmar={salvar}
          onAjustar={() => setEtapa(3)}
          salvando={salvando}
        />
      )}

      {etapa === 3 && (
        <PassoAjuste
          config={config}
          setConfig={setConfig}
          clientes={clientes}
          erros={erros}
          salvoId={salvoId}
          salvando={salvando}
          onSalvar={salvar}
          onArquivar={
            salvoId
              ? () =>
                  iniciarSalvamento(async () => {
                    await arquivarFunilAction(salvoId);
                    router.push('/dashboard/inteligencia-de-dados/construtor-funil');
                    router.refresh();
                  })
              : undefined
          }
        />
      )}
    </div>
  );
}

// ── Funis já cadastrados ─────────────────────────────────────────────────────

function FunisCadastrados({
  funis,
  clientes,
  atual,
}: {
  funis: FunilResumo[];
  clientes: ClienteResumo[];
  atual: string | null;
}) {
  if (funis.length === 0) return null;
  const nomeCliente = new Map(clientes.map((c) => [c.id, c.nome]));

  return (
    <section className="card">
      <h2 className="text-xs font-extrabold tracking-tight mb-2">
        Funis cadastrados · {funis.length}
      </h2>
      <div className="flex flex-wrap gap-2">
        {funis.map((f) => (
          <a
            key={f.id}
            href={`/dashboard/inteligencia-de-dados/construtor-funil?editar=${f.id}`}
            className={cn(
              'px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition',
              f.id === atual
                ? 'border-success bg-success/10 text-success'
                : 'border-[rgb(var(--border))] hover:border-navy/40',
            )}
          >
            <Pencil size={10} />
            <span className="truncate max-w-[220px]">{f.nome}</span>
            <span className="text-[9px] text-[rgb(var(--muted))]">
              {nomeCliente.get(f.clientId) ?? '—'} · {FAMILIAS[f.familia].nome}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Passo 1 · Conectar ───────────────────────────────────────────────────────

function PassoConectar({
  tipoFonte,
  setTipoFonte,
  fonte,
  setFonte,
  onDetectar,
  onPular,
}: {
  tipoFonte: TipoFonte;
  setTipoFonte: (t: TipoFonte) => void;
  fonte: string;
  setFonte: (f: string) => void;
  onDetectar: () => void;
  onPular: () => void;
}) {
  const tipos: Array<{ id: TipoFonte; icone: typeof Table2; nome: string; desc: string }> = [
    { id: 'sheet', icone: Table2, nome: 'Google Sheets', desc: 'Planilha de extração' },
    { id: 'api', icone: Plug, nome: 'API externa', desc: 'Meta · GA4 · Kommo' },
    { id: 'db', icone: Database, nome: 'Banco de dados', desc: 'Postgres · Supabase' },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">Conectar fonte de dados</h2>
          <p className="text-[11px] text-[rgb(var(--muted))] mt-1">
            Aponte de onde vêm os dados do funil. O sistema lê os campos disponíveis e classifica o
            funil automaticamente.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-2">
          {tipos.map((t) => {
            const Icone = t.icone;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoFonte(t.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition',
                  tipoFonte === t.id
                    ? 'border-navy bg-navy/5 ring-1 ring-navy/20'
                    : 'border-[rgb(var(--border))] hover:border-navy/40',
                )}
              >
                <Icone size={18} className="text-navy" />
                <div className="text-xs font-extrabold mt-1.5">{t.nome}</div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{t.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="fonte"
            className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]"
          >
            {tipoFonte === 'sheet' ? 'Planilha' : tipoFonte === 'api' ? 'Endpoint' : 'Connection string'}
          </label>
          <select
            id="fonte"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            className="input-wizard"
          >
            {FONTES_EXEMPLO.map((f) => (
              <option key={f.chave} value={f.chave}>
                {f.rotulo}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[rgb(var(--muted))]">
            O conector real ainda não está implementado — estas são fontes de exemplo com os campos
            já mapeados, pra validar a inferência ponta a ponta. Pra cadastrar um funil do zero,
            pule direto para o ajuste manual.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDetectar}
            className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition"
          >
            Detectar funil automaticamente →
          </button>
          <button
            type="button"
            onClick={onPular}
            className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-xs font-extrabold hover:border-navy/40 transition"
          >
            Cadastrar manualmente
          </button>
        </div>
      </div>

      <aside className="card">
        <h3 className="text-xs font-extrabold tracking-tight mb-3">Como funciona</h3>
        <ol className="space-y-2">
          {[
            'Você conecta a fonte (Sheet · API · Banco)',
            'Sistema lê os campos disponíveis',
            'Classifica família · sub-objetivo · captura · etapas',
            'Você confirma ou ajusta manualmente',
            'Funil salvo · cone · KPIs · tabelas dinâmicas',
          ].map((t, i) => (
            <li key={t} className="flex gap-2 text-[11px]">
              <span className="font-extrabold text-navy shrink-0">{i + 1}.</span>
              <span className="text-[rgb(var(--muted))]">{t}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

// ── Passo 2 · Reconhecimento ─────────────────────────────────────────────────

function PassoReconhecimento({
  recog,
  config,
  onConfirmar,
  onAjustar,
  salvando,
}: {
  recog: Reconhecimento;
  config: ConfigFunil;
  onConfirmar: () => void;
  onAjustar: () => void;
  salvando: boolean;
}) {
  const corConfianca =
    recog.confianca === 'alta'
      ? 'text-success'
      : recog.confianca === 'média'
        ? 'text-attention'
        : 'text-warn';

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-4">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold tracking-tight">
              Detectado: {SUBOBJETIVOS[recog.familia].find((s) => s.id === recog.subObjetivo)?.nome}
            </h2>
            <span className={cn('text-[10px] font-extrabold', corConfianca)}>
              ● confiança {recog.confianca}
            </span>
          </div>

          <Secao titulo="Cliente · Funil (inferido pelo nome da fonte)">
            <p className="text-sm font-extrabold">
              {config.cliente} · {config.nome}
            </p>
          </Secao>

          <Secao titulo="Classificação automática">
            <div className="flex flex-wrap gap-1.5">
              <Pill>
                {FAMILIAS[recog.familia].icone} {FAMILIAS[recog.familia].nome}
              </Pill>
              <Pill>{SUBOBJETIVOS[recog.familia].find((s) => s.id === recog.subObjetivo)?.nome}</Pill>
              <Pill>{CAPTURAS[recog.captura].nome}</Pill>
              <Pill>{recog.camposDetectados.length} etapas</Pill>
            </div>
          </Secao>

          <Secao titulo="Campos detectados na fonte (viram etapas do cone)">
            <div className="flex flex-wrap gap-1.5">
              {recog.camposDetectados.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 rounded border border-[rgb(var(--border))] text-[10px] font-bold flex items-center gap-1"
                >
                  {ETAPAS[id].label}
                  {id === recog.marcadorMkt && <Marcador tipo="MKT" />}
                  {id === recog.marcadorCom && <Marcador tipo="COM" />}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
              Etapas com <Marcador tipo="MKT" /> e <Marcador tipo="COM" /> marcam onde termina o
              trabalho do marketing e o do comercial.
            </p>
          </Secao>

          <Secao titulo="KPI primário projetado">
            <p className="text-sm font-extrabold">{recog.kpiPrimario}</p>
          </Secao>
        </div>

        <div className="card">
          <h3 className="text-xs font-extrabold tracking-tight">Está certo?</h3>
          <p className="text-[11px] text-[rgb(var(--muted))] mt-1">
            Se a inferência está correta, salva direto. Se faltou algo, abre o ajuste manual.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={onConfirmar}
              disabled={salvando}
              className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {salvando && <Loader2 size={12} className="animate-spin" />}✓ Confirmar e salvar
            </button>
            <button
              type="button"
              onClick={onAjustar}
              className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-xs font-extrabold hover:border-navy/40 transition"
            >
              Ajustar manualmente
            </button>
          </div>
        </div>
      </div>

      <aside className="card">
        <h3 className="text-xs font-extrabold tracking-tight mb-2">Preview do funil</h3>
        <FunilCone etapas={conePreview(config)} compacto />
      </aside>
    </div>
  );
}

// ── Passo 3 · Ajuste manual ──────────────────────────────────────────────────

function PassoAjuste({
  config,
  setConfig,
  clientes,
  erros,
  salvoId,
  salvando,
  onSalvar,
  onArquivar,
}: {
  config: ConfigFunil;
  setConfig: React.Dispatch<React.SetStateAction<ConfigFunil>>;
  clientes: ClienteResumo[];
  erros: ErroValidacao[];
  salvoId: string | null;
  salvando: boolean;
  onSalvar: () => void;
  onArquivar?: () => void;
}) {
  function set<K extends keyof ConfigFunil>(chave: K, valor: ConfigFunil[K]) {
    setConfig((c) => ({ ...c, [chave]: valor }));
  }

  /** Trocar de família invalida sub-objetivo e etapas que não existem nela. */
  function trocarFamilia(familia: Familia) {
    setConfig((c) => ({
      ...c,
      familia,
      subObjetivo: null,
      etapas: c.etapas.filter((e) => ETAPAS[e].familias.includes(familia)),
    }));
  }

  function alternarEtapa(id: EtapaId) {
    setConfig((c) => {
      const presente = c.etapas.includes(id);
      const etapas = presente ? c.etapas.filter((e) => e !== id) : [...c.etapas, id];
      return {
        ...c,
        etapas: ordenarEtapas(etapas),
        // Um marcador não pode apontar pra etapa que saiu do funil.
        marcadorMkt: presente && c.marcadorMkt === id ? null : c.marcadorMkt,
        marcadorCom: presente && c.marcadorCom === id ? null : c.marcadorCom,
      };
    });
  }

  const pool = useMemo(() => {
    if (!config.familia) return [];
    return (Object.keys(ETAPAS) as EtapaId[]).filter((id) =>
      ETAPAS[id].familias.includes(config.familia!),
    );
  }, [config.familia]);

  const etapasOrdenadas = ordenarEtapas(config.etapas);
  const errosPorCampo = new Map(erros.map((e) => [e.campo, e.mensagem]));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="card space-y-5">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">Ajuste manual</h2>
          <p className="text-[11px] text-[rgb(var(--muted))] mt-1">
            Wizard pré-preenchido com o que foi inferido. Mude o que precisar.
          </p>
        </div>

        <Passo num={1} titulo="Identificação">
          <div className="grid sm:grid-cols-2 gap-3">
            <Campo label="Cliente" erro={errosPorCampo.get('cliente')}>
              <select
                value={config.clientId ?? ''}
                onChange={(e) => {
                  const cliente = clientes.find((c) => c.id === e.target.value);
                  setConfig((c) => ({
                    ...c,
                    clientId: cliente?.id,
                    cliente: cliente?.nome ?? '',
                  }));
                }}
                className="input-wizard"
              >
                <option value="">—</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Nome do funil" erro={errosPorCampo.get('nome')}>
              <input
                type="text"
                value={config.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="ex: Kedma · Aplicação"
                className="input-wizard"
              />
            </Campo>
          </div>
        </Passo>

        <Passo num={2} titulo="Família" erro={errosPorCampo.get('familia')}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {(Object.keys(FAMILIAS) as Familia[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => trocarFamilia(f)}
                className={cn(
                  'p-2.5 rounded-lg border text-left transition',
                  config.familia === f
                    ? 'border-navy bg-navy/5 ring-1 ring-navy/20'
                    : 'border-[rgb(var(--border))] hover:border-navy/40',
                )}
              >
                <div className="text-navy">{FAMILIAS[f].icone}</div>
                <div className="text-[11px] font-extrabold mt-0.5">{FAMILIAS[f].nome}</div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{FAMILIAS[f].desc}</div>
              </button>
            ))}
          </div>
        </Passo>

        <Passo num={3} titulo="Sub-objetivo" erro={errosPorCampo.get('subObjetivo')}>
          {!config.familia ? (
            <Vazio>Selecione a família primeiro.</Vazio>
          ) : (
            <div className="space-y-1.5">
              {SUBOBJETIVOS[config.familia].map((s) => (
                <Opcao
                  key={s.id}
                  ativo={config.subObjetivo === s.id}
                  onClick={() => set('subObjetivo', s.id as SubObjetivo)}
                  nome={s.nome}
                  desc={s.desc}
                />
              ))}
            </div>
          )}
        </Passo>

        <Passo num={4} titulo="Modo de captura" erro={errosPorCampo.get('captura')}>
          <div className="space-y-1.5">
            {(Object.keys(CAPTURAS) as ModoCaptura[]).map((c) => (
              <Opcao
                key={c}
                ativo={config.captura === c}
                onClick={() => set('captura', c)}
                nome={CAPTURAS[c].nome}
                desc={CAPTURAS[c].desc}
              />
            ))}
          </div>
          {config.captura === 'formulario_nativo' && config.etapas.includes('page_view') && (
            <p className="text-[10px] text-attention mt-2">
              Formulário nativo não tem página pra visitar: a etapa Page View fica cadastrada, mas
              o cone e as tabelas pulam ela automaticamente.
            </p>
          )}
        </Passo>

        <Passo num={5} titulo="Etapas do funil" erro={errosPorCampo.get('etapas')}>
          {!config.familia ? (
            <Vazio>Selecione a família primeiro.</Vazio>
          ) : (
            <>
              <p className="text-[10px] text-[rgb(var(--muted))] mb-2">
                Etapas disponíveis para esta família. As selecionadas formam o cone.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pool.map((id) => {
                  const ativo = config.etapas.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => alternarEtapa(id)}
                      className={cn(
                        'px-2 py-1 rounded border text-[10px] font-bold transition flex items-center gap-1',
                        ativo
                          ? 'bg-navy text-white border-navy'
                          : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
                      )}
                    >
                      {ativo && <Check size={10} />}
                      {ETAPAS[id].label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Passo>

        <Passo num={6} titulo="Marcadores">
          <div className="grid sm:grid-cols-2 gap-3">
            <Campo label="Conv. Marketing termina em" erro={errosPorCampo.get('marcadorMkt')}>
              <select
                value={config.marcadorMkt ?? ''}
                onChange={(e) => set('marcadorMkt', (e.target.value || null) as EtapaId | null)}
                className="input-wizard"
              >
                <option value="">—</option>
                {etapasOrdenadas.map((id) => (
                  <option key={id} value={id}>
                    {ETAPAS[id].label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Conv. Comercial termina em" erro={errosPorCampo.get('marcadorCom')}>
              <select
                value={config.marcadorCom ?? ''}
                onChange={(e) => set('marcadorCom', (e.target.value || null) as EtapaId | null)}
                className="input-wizard"
              >
                <option value="">—</option>
                {etapasOrdenadas.map((id) => (
                  <option key={id} value={id}>
                    {ETAPAS[id].label}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </Passo>

        <Passo num={7} titulo="Metas por etapa">
          {etapasOrdenadas.length === 0 ? (
            <Vazio>Selecione as etapas primeiro.</Vazio>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {etapasOrdenadas.map((id) => (
                <Campo key={id} label={ETAPAS[id].label}>
                  <input
                    type="number"
                    min={0}
                    value={config.metas[id] ?? ''}
                    onChange={(e) =>
                      setConfig((c) => {
                        const metas = { ...c.metas };
                        if (e.target.value === '') delete metas[id];
                        else metas[id] = Number(e.target.value);
                        return { ...c, metas };
                      })
                    }
                    placeholder="—"
                    className="input-wizard"
                  />
                </Campo>
              ))}
            </div>
          )}
        </Passo>

        {errosPorCampo.get('geral') && (
          <div className="bg-warn/10 border border-warn/30 text-warn rounded-lg p-3 text-[11px]">
            {errosPorCampo.get('geral')}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[rgb(var(--border))]">
          <button
            type="button"
            onClick={onSalvar}
            disabled={salvando}
            className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {salvando && <Loader2 size={12} className="animate-spin" />}
            {config.id ? 'Salvar alterações' : 'Salvar configuração'}
          </button>

          {onArquivar && (
            <button
              type="button"
              onClick={onArquivar}
              disabled={salvando}
              className="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-[11px] font-extrabold text-warn hover:border-warn transition"
            >
              Arquivar funil
            </button>
          )}

          {salvoId && !salvando && (
            <span className="text-[11px] font-bold text-success flex items-center gap-1">
              <Check size={12} /> Salvo · já disponível no filtro de funil das 5 abas
            </span>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card">
          <h3 className="text-xs font-extrabold tracking-tight mb-2">Funil cone</h3>
          <FunilCone etapas={conePreview(config)} compacto />
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
            Preview com metas ou curva de exemplo. Os valores reais entram quando o sync do funil
            rodar.
          </p>
        </div>

        <div className="card">
          <h3 className="text-xs font-extrabold tracking-tight mb-2">JSON da configuração</h3>
          <pre className="text-[10px] leading-relaxed bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded p-2 overflow-x-auto max-h-72 overflow-y-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
            É esta config que vai pra tabela <code>funis</code> no schema{' '}
            <code>infotrafego_ecossistema</code>.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ── Auxiliares ───────────────────────────────────────────────────────────────

/**
 * Cone de preview.
 *
 * Sem dados reais, usa a meta da etapa quando existe e uma curva de decaimento
 * quando não — serve pra dar noção de FORMA, que é o que o gestor valida aqui.
 */
function conePreview(config: ConfigFunil) {
  const etapas = ordenarEtapas(config.etapas);
  const base = 100_000;
  const stages: Partial<Record<EtapaId, number>> = {};
  etapas.forEach((id, i) => {
    stages[id] = config.metas[id] ?? Math.round(base * Math.pow(0.45, i));
  });

  const total: LinhaBruta = {
    id: 'preview',
    nome: 'preview',
    status: 'active',
    spend: 0,
    impressoes: stages.impressao ?? 0,
    cliques: stages.clique ?? 0,
    pageViews: stages.page_view ?? 0,
    leads: stages.lead ?? 0,
    mqls: stages.mql ?? 0,
    agend: stages.agendamento ?? 0,
    stages,
  };

  return montarCone(config, total);
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-1">
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full bg-navy/10 text-navy text-[10px] font-extrabold">
      {children}
    </span>
  );
}

function Marcador({ tipo }: { tipo: 'MKT' | 'COM' }) {
  return (
    <span
      className={cn(
        'px-1 rounded text-[8px] font-extrabold text-white',
        tipo === 'MKT' ? 'bg-navy' : 'bg-success',
      )}
    >
      {tipo}
    </span>
  );
}

function Passo({
  num,
  titulo,
  erro,
  children,
}: {
  num: number;
  titulo: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[rgb(var(--border))] pt-4 first:border-0 first:pt-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-extrabold">
          {num}
        </span>
        <h3 className="text-xs font-extrabold tracking-tight">{titulo}</h3>
        {erro && <span className="text-[10px] font-bold text-warn">{erro}</span>}
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  erro,
  children,
}: {
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {erro && <span className="text-[10px] font-bold text-warn mt-0.5 block">{erro}</span>}
    </label>
  );
}

function Opcao({
  ativo,
  onClick,
  nome,
  desc,
}: {
  ativo: boolean;
  onClick: () => void;
  nome: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 p-2 rounded-lg border text-left transition',
        ativo ? 'border-navy bg-navy/5' : 'border-[rgb(var(--border))] hover:border-navy/40',
      )}
    >
      <span
        className={cn(
          'w-3.5 h-3.5 rounded-full border-[3px] shrink-0',
          ativo ? 'border-navy bg-white' : 'border-[rgb(var(--border))]',
        )}
      />
      <span>
        <span className="block text-[11px] font-extrabold">{nome}</span>
        <span className="block text-[10px] text-[rgb(var(--muted))]">{desc}</span>
      </span>
    </button>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-[rgb(var(--muted))] py-3 text-center border border-dashed border-[rgb(var(--border))] rounded-lg">
      {children}
    </p>
  );
}
