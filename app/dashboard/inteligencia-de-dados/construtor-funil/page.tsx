'use client';

/**
 * Construtor de Funil · wizard de 3 etapas
 *
 * Referência visual: docs/mockups/construtor-funil/index.html (v0.2).
 *   1 · Conectar fonte de dados
 *   2 · Reconhecimento automático (regras determinísticas em lib/funil.ts)
 *   3 · Ajuste manual, com preview do cone e o JSON da config
 *
 * A config gerada aqui é o que alimenta cone, KPIs e tabelas de todas as abas —
 * por isso o preview usa o MESMO componente FunilCone da Visão Geral.
 */

import { useMemo, useState } from 'react';
import { Check, Database, Plug, Table2 } from 'lucide-react';
import { FunilCone, type FunilEtapa } from '@/components/dashboard/funil-cone';
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
import { cn } from '@/lib/utils';

const CLIENTES = [
  'Infotráfego', 'Aba Acessível', 'Carv Group', 'Cristina Florentino',
  'Gisele Luvizuto', 'Giulia Molinari', 'Grupo Kedma', 'Stella Santini',
];

type TipoFonte = 'sheet' | 'api' | 'db';

export default function ConstrutorFunilPage() {
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [maxEtapa, setMaxEtapa] = useState<1 | 2 | 3>(1);
  const [tipoFonte, setTipoFonte] = useState<TipoFonte>('sheet');
  const [fonte, setFonte] = useState(FONTES_EXEMPLO[0].chave);
  const [recog, setRecog] = useState<Reconhecimento | null>(null);
  const [config, setConfig] = useState<ConfigFunil>(CONFIG_VAZIA);
  const [salvo, setSalvo] = useState(false);

  function detectar() {
    const f = FONTES_EXEMPLO.find((x) => x.chave === fonte)!;
    const r = reconhecer(f.campos);
    setRecog(r);
    setConfig({
      cliente: f.cliente,
      nome: f.nome,
      familia: r.familia,
      subObjetivo: r.subObjetivo,
      captura: r.captura,
      etapas: r.camposDetectados,
      marcadorMkt: r.marcadorMkt,
      marcadorCom: r.marcadorCom,
      metas: {},
    });
    setSalvo(false);
    setEtapa(2);
    setMaxEtapa(3);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Construtor de Funil</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Cadastre a configuração uma vez · cone, KPIs e tabelas renderizam sozinhos
        </p>
      </header>

      {/* Abas do wizard */}
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
        />
      )}

      {etapa === 2 && recog && (
        <PassoReconhecimento
          recog={recog}
          config={config}
          onConfirmar={() => {
            setSalvo(true);
            setEtapa(3);
          }}
          onAjustar={() => setEtapa(3)}
        />
      )}

      {etapa === 3 && (
        <PassoAjuste config={config} setConfig={setConfig} salvo={salvo} onSalvar={() => setSalvo(true)} />
      )}
    </div>
  );
}

// ── Passo 1 · Conectar ───────────────────────────────────────────────────────

function PassoConectar({
  tipoFonte,
  setTipoFonte,
  fonte,
  setFonte,
  onDetectar,
}: {
  tipoFonte: TipoFonte;
  setTipoFonte: (t: TipoFonte) => void;
  fonte: string;
  setFonte: (f: string) => void;
  onDetectar: () => void;
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
          <label htmlFor="fonte" className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
            {tipoFonte === 'sheet' ? 'Planilha' : tipoFonte === 'api' ? 'Endpoint' : 'Connection string'}
          </label>
          <select
            id="fonte"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            className="w-full px-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-xs font-bold outline-none focus:border-navy/50"
          >
            {FONTES_EXEMPLO.map((f) => (
              <option key={f.chave} value={f.chave}>
                {f.rotulo}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[rgb(var(--muted))]">
            O conector real ainda não está implementado — estas são fontes de exemplo com os campos
            já mapeados, pra validar a inferência ponta a ponta.
          </p>
        </div>

        <button
          type="button"
          onClick={onDetectar}
          className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition"
        >
          Detectar funil automaticamente →
        </button>
      </div>

      <aside className="card">
        <h3 className="text-xs font-extrabold tracking-tight mb-3">Como funciona</h3>
        <ol className="space-y-2">
          {[
            'Você conecta a fonte (Sheet · API · Banco)',
            'Sistema lê os campos disponíveis',
            'Classifica família · sub-objetivo · captura · etapas',
            'Você confirma ou ajusta manualmente',
            'Funil pronto · cone · KPIs · tabelas dinâmicas',
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
}: {
  recog: Reconhecimento;
  config: ConfigFunil;
  onConfirmar: () => void;
  onAjustar: () => void;
}) {
  const corConfianca =
    recog.confianca === 'alta' ? 'text-success' : recog.confianca === 'média' ? 'text-attention' : 'text-warn';

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
              <Pill>{FAMILIAS[recog.familia].icone} {FAMILIAS[recog.familia].nome}</Pill>
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
              className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition"
            >
              ✓ Confirmar e salvar
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
        <FunilCone etapas={etapasParaCone(config)} />
      </aside>
    </div>
  );
}

// ── Passo 3 · Ajuste manual ──────────────────────────────────────────────────

function PassoAjuste({
  config,
  setConfig,
  salvo,
  onSalvar,
}: {
  config: ConfigFunil;
  setConfig: (c: ConfigFunil) => void;
  salvo: boolean;
  onSalvar: () => void;
}) {
  function set<K extends keyof ConfigFunil>(chave: K, valor: ConfigFunil[K]) {
    setConfig({ ...config, [chave]: valor });
  }

  /** Trocar de família invalida sub-objetivo e etapas que não existem nela. */
  function trocarFamilia(familia: Familia) {
    setConfig({
      ...config,
      familia,
      subObjetivo: null,
      etapas: config.etapas.filter((e) => ETAPAS[e].familias.includes(familia)),
    });
  }

  function alternarEtapa(id: EtapaId) {
    const presente = config.etapas.includes(id);
    const etapas = presente ? config.etapas.filter((e) => e !== id) : [...config.etapas, id];
    setConfig({
      ...config,
      etapas: ordenarEtapas(etapas),
      // Um marcador não pode apontar pra etapa que saiu do funil.
      marcadorMkt: presente && config.marcadorMkt === id ? null : config.marcadorMkt,
      marcadorCom: presente && config.marcadorCom === id ? null : config.marcadorCom,
    });
  }

  const pool = useMemo(() => {
    if (!config.familia) return [];
    return (Object.keys(ETAPAS) as EtapaId[]).filter((id) =>
      ETAPAS[id].familias.includes(config.familia!),
    );
  }, [config.familia]);

  const etapasOrdenadas = ordenarEtapas(config.etapas);

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
            <Campo label="Cliente">
              <select
                value={config.cliente}
                onChange={(e) => set('cliente', e.target.value)}
                className="input-wizard"
              >
                <option value="">—</option>
                {CLIENTES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Nome do funil">
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

        <Passo num={2} titulo="Família">
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

        <Passo num={3} titulo="Sub-objetivo">
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

        <Passo num={4} titulo="Modo de captura">
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
        </Passo>

        <Passo num={5} titulo="Etapas do funil">
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
            <Campo label="Conv. Marketing termina em">
              <select
                value={config.marcadorMkt ?? ''}
                onChange={(e) => set('marcadorMkt', (e.target.value || null) as EtapaId | null)}
                className="input-wizard"
              >
                <option value="">—</option>
                {etapasOrdenadas.map((id) => (
                  <option key={id} value={id}>{ETAPAS[id].label}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Conv. Comercial termina em">
              <select
                value={config.marcadorCom ?? ''}
                onChange={(e) => set('marcadorCom', (e.target.value || null) as EtapaId | null)}
                className="input-wizard"
              >
                <option value="">—</option>
                {etapasOrdenadas.map((id) => (
                  <option key={id} value={id}>{ETAPAS[id].label}</option>
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
                      set('metas', {
                        ...config.metas,
                        [id]: e.target.value === '' ? undefined : Number(e.target.value),
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

        <div className="flex items-center gap-3 pt-2 border-t border-[rgb(var(--border))]">
          <button
            type="button"
            onClick={onSalvar}
            className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold hover:bg-navy-soft transition"
          >
            Salvar configuração
          </button>
          {salvo && (
            <span className="text-[11px] font-bold text-success flex items-center gap-1">
              <Check size={12} /> Config válida · pronta pra persistir no Supabase
            </span>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card">
          <h3 className="text-xs font-extrabold tracking-tight mb-2">Funil cone</h3>
          <FunilCone etapas={etapasParaCone(config)} />
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
 * Converte a config em etapas do cone. Sem dados reais ainda, o preview usa uma
 * curva de decaimento só pra dar noção de forma — os valores reais entram
 * quando o funil estiver ligado à fonte.
 */
function etapasParaCone(config: ConfigFunil): FunilEtapa[] {
  const etapas = ordenarEtapas(config.etapas);
  const base = 100_000;
  return etapas.map((id, i) => ({
    id,
    label: ETAPAS[id].label,
    value: config.metas[id] ?? Math.round(base * Math.pow(0.45, i)),
  }));
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

function Passo({ num, titulo, children }: { num: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[rgb(var(--border))] pt-4 first:border-0 first:pt-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-extrabold">
          {num}
        </span>
        <h3 className="text-xs font-extrabold tracking-tight">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
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
