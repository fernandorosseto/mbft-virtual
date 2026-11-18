'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, Check, ChevronRight, Link2, ListChecks, RotateCcw, X } from 'lucide-react';
import type { Assunto, Enquadramento, Questao, Tema, TopicoTeoria, Visual } from '@/types/conteudo';
import { ASSUNTOS, NORMAS } from '@/data/conteudo';
import { obterDispositivo as disp } from '@/data/normas/dispositivos';
import { urlDe } from '@/lib/navegacao';
import { WindshieldDamageDiagram } from './WindshieldDamageDiagram';
import { Aviso, BlocoFontes, TextoDispositivo, TextoRico } from './Blocos';
import painel from './InfoPanel.module.css';
import styles from './Aula.module.css';

// ---------------------------------------------------------------------------
// Teoria
// ---------------------------------------------------------------------------

export function Teoria({ topicos }: { topicos: TopicoTeoria[] }) {
  return (
    <div className={styles.teoria}>
      {topicos.map((t, i) => (
        <section key={t.titulo} className={styles.topico}>
          <h3 className={styles.topicoTitulo}>
            <span className={styles.topicoNumero}>{i + 1}</span>
            <span>{t.titulo}</span>
          </h3>
          {t.paragrafos.map((p, j) => (
            <p key={j} className={painel.text}>
              <TextoRico texto={p} />
            </p>
          ))}
          {t.itens && (
            <ul className={styles.topicoItens}>
              {t.itens.map((item, j) => (
                <li key={j}>
                  <TextoRico texto={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Itens visuais
// ---------------------------------------------------------------------------

export function Visuais({ visuais, assunto }: { visuais: Visual[]; assunto: Assunto }) {
  return (
    <>
      {visuais.map((v, i) => {
        switch (v.tipo) {
          case 'tabela':
            return <Tabela key={i} visual={v} />;
          case 'linhaDoTempo':
            return <LinhaDoTempo key={i} titulo={v.titulo} eventos={v.eventos} />;
          case 'mapaDanos':
            return assunto.visaoGeral?.comparativoVeiculos ? (
              <WindshieldDamageDiagram
                key={i}
                comparison={assunto.visaoGeral.comparativoVeiculos}
                inicial={assunto.veiculo && assunto.veiculo !== 'automovel' ? 'pesados' : 'passeio'}
              />
            ) : null;
          case 'calculadoraVC':
            return <CalculadoraVC key={i} />;
        }
      })}
    </>
  );
}

function Tabela({ visual }: { visual: Extract<Visual, { tipo: 'tabela' }> }) {
  return (
    <figure className={styles.quadro}>
      <figcaption className={styles.quadroTitulo}>{visual.titulo}</figcaption>
      <div className={styles.tabelaRolagem}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              {visual.colunas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.linhas.map((linha, i) => (
              <tr key={i}>
                {linha.map((celula, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      <TextoRico texto={celula} />
                    </th>
                  ) : (
                    <td key={j}>
                      <TextoRico texto={celula} />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visual.nota && (
        <p className={styles.quadroNota}>
          <TextoRico texto={visual.nota} />
        </p>
      )}
    </figure>
  );
}

function LinhaDoTempo({ titulo, eventos }: { titulo: string; eventos: { data: string; texto: string }[] }) {
  return (
    <figure className={styles.quadro}>
      <figcaption className={styles.quadroTitulo}>{titulo}</figcaption>
      <ol className={styles.linhaTempo}>
        {eventos.map((e) => (
          <li key={e.data + e.texto}>
            <span className={styles.linhaData}>{e.data}</span>
            <span>
              <TextoRico texto={e.texto} />
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** Simulador do Valor Considerado (Res. 960/2022, art. 19, § 1º). */
function CalculadoraVC() {
  const [medicao, setMedicao] = useState('60');
  const mr = Number(medicao.replace(',', '.'));
  const valido = medicao.trim() !== '' && Number.isFinite(mr) && mr >= 0 && mr <= 100;
  const vc = valido ? Math.round((mr + 7) * 10) / 10 : null;
  const formatar = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  return (
    <figure className={styles.quadro}>
      <figcaption className={styles.quadroTitulo}>
        <Calculator size={16} />
        <span>Simulador: medição × Valor Considerado</span>
      </figcaption>
      <p className={styles.quadroNota}>
        Vidro de área indispensável à dirigibilidade (mínimo de 70%, art. 4º, I). Digite a medição realizada pelo medidor de transmitância luminosa (MTL).
      </p>
      <label className={styles.calcLinha}>
        <span>Medição realizada (MR)</span>
        <span className={styles.calcCampo}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.1}
            value={medicao}
            onChange={(e) => setMedicao(e.target.value)}
            aria-describedby="vc-resultado"
          />
          %
        </span>
      </label>
      <div id="vc-resultado" className={styles.calcResultado} aria-live="polite">
        {vc === null ? (
          <span>Digite um valor entre 0 e 100.</span>
        ) : (
          <>
            <span className={styles.calcConta}>
              VC = {formatar(mr)}% + 7% = <b>{formatar(vc)}%</b>
            </span>
            <span className={vc < 70 ? styles.calcIrregular : styles.calcRegular}>
              {vc < 70 ? 'Abaixo de 70%: há infração (art. 230, XVI, do CTB)' : 'Igual ou acima de 70%: não há infração por transmitância'}
            </span>
          </>
        )}
      </div>
      <p className={styles.quadroNota}>
        O auto de infração registra os três valores: a medição, o valor considerado e o limite da área fiscalizada (art. 19, I a
        III).
      </p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Conexões e revisão
// ---------------------------------------------------------------------------

export function Conexoes({ assunto }: { assunto: Assunto }) {
  const conexoes = assunto.aula?.conexoes ?? [];
  if (conexoes.length === 0) return null;
  return (
    <div>
      <h3 className={painel.sectionTitle}>
        <Link2 size={18} />
        <span>Conexões</span>
      </h3>
      <ul className={styles.conexoes}>
        {conexoes.map((c) => (
          <li key={c.titulo}>
            <b>{c.titulo}</b>
            <span>
              <TextoRico texto={c.texto} />
            </span>
            {c.dispositivos && c.dispositivos.length > 0 && (
              <small>{c.dispositivos.map((id) => disp(id).rotulo).join(' · ')}</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Revisao({ frases }: { frases: string[] }) {
  return (
    <div className={styles.revisao}>
      <h3 className={painel.sectionTitle}>
        <ListChecks size={18} />
        <span>Revisão rápida</span>
      </h3>
      <ol>
        {frases.map((f, i) => (
          <li key={i}>
            <TextoRico texto={f} />
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Questões Certo/Errado
// ---------------------------------------------------------------------------

type Resposta = 'C' | 'E';

/** Questões no estilo da banca: cada acerto vale +1 e cada erro −1; em branco, 0. */
export function Questoes({ questoes }: { questoes: Questao[] }) {
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const respondidas = Object.keys(respostas).length;
  const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length;
  const erros = respondidas - acertos;

  return (
    <div className={styles.questoes}>
      <div className={styles.placar} aria-live="polite">
        <div>
          <small>Respondidas</small>
          <b>
            {respondidas}/{questoes.length}
          </b>
        </div>
        <div>
          <small>Acertos</small>
          <b className={styles.placarOk}>{acertos}</b>
        </div>
        <div>
          <small>Erros</small>
          <b className={styles.placarErro}>{erros}</b>
        </div>
        <div>
          <small>Nota líquida</small>
          <b>{acertos - erros}</b>
        </div>
      </div>
      <p className={styles.quadroNota}>Julgue os itens. Como na prova, um erro anula um acerto.</p>
      <ol className={styles.listaQuestoes}>
        {questoes.map((q, i) => (
          <ItemQuestao
            key={q.id}
            numero={i + 1}
            questao={q}
            resposta={respostas[q.id]}
            responder={(r) => setRespostas((atual) => ({ ...atual, [q.id]: r }))}
          />
        ))}
      </ol>
      {respondidas > 0 && (
        <button type="button" className={styles.refazer} onClick={() => setRespostas({})}>
          <RotateCcw size={16} />
          <span>Refazer as questões</span>
        </button>
      )}
    </div>
  );
}

function ItemQuestao({
  numero,
  questao,
  resposta,
  responder,
}: {
  numero: number;
  questao: Questao;
  resposta?: Resposta;
  responder: (r: Resposta) => void;
}) {
  const acertou = resposta === questao.gabarito;
  return (
    <li className={`${styles.questao} ${resposta ? (acertou ? styles.questaoCerta : styles.questaoErrada) : ''}`}>
      <p className={styles.enunciado}>
        <span className={styles.numeroQuestao}>{numero}.</span> <TextoRico texto={questao.enunciado} />
      </p>
      <div className={styles.opcoes} role="group" aria-label={`Item ${numero}: certo ou errado`}>
        {(['C', 'E'] as const).map((op) => (
          <button
            key={op}
            type="button"
            disabled={!!resposta}
            aria-pressed={resposta === op}
            className={`${styles.opcao} ${resposta === op ? styles.opcaoMarcada : ''} ${
              resposta && questao.gabarito === op ? styles.opcaoGabarito : ''
            }`}
            onClick={() => responder(op)}
          >
            {op === 'C' ? 'Certo' : 'Errado'}
          </button>
        ))}
      </div>
      {resposta && (
        <div className={styles.comentario}>
          <p className={acertou ? styles.resultadoOk : styles.resultadoErro}>
            {acertou ? <Check size={16} /> : <X size={16} />}
            <span>
              {acertou ? 'Você acertou.' : 'Você errou.'} Gabarito: <b>{questao.gabarito === 'C' ? 'Certo' : 'Errado'}</b>.
            </span>
          </p>
          <p className={painel.text}>
            <TextoRico texto={questao.comentario} />
          </p>
          <small>{questao.dispositivos.map((id) => disp(id).rotulo).join(' · ')}</small>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Página da resolução
// ---------------------------------------------------------------------------

const SEM_ENQUADRAMENTOS: Enquadramento[] = [];

export function PaginaDaResolucao({ tema }: { tema: Tema }) {
  const pagina = tema.pagina!;
  return (
    <>
      <p className={painel.lead}>{pagina.resumo}</p>

      <dl className={styles.fichaTecnica}>
        {pagina.fichaTecnica.map((f) => (
          <div key={f.rotulo}>
            <dt>{f.rotulo}</dt>
            <dd>
              <TextoRico texto={f.valor} />
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className={painel.sectionTitle}>Por que cai na prova</h3>
        <ul className={styles.topicoItens}>
          {pagina.porQueCai.map((p, i) => (
            <li key={i}>
              <TextoRico texto={p} />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className={painel.sectionTitle}>Mapa da norma</h3>
        <p className={styles.quadroNota}>Cada trecho da resolução e onde ele é explicado.</p>
        <ul className={painel.listaZonas}>
          {pagina.mapa.map((item) => {
            const assunto = item.assunto ? ASSUNTOS[item.assunto] : null;
            const conteudo = (
              <>
                <span className={styles.mapaRotulo}>{item.rotulo}</span>
                <span className={painel.itemZonaTexto}>
                  <b>{item.resumo}</b>
                  <small>{assunto ? assunto.titulo : 'Explicado nesta página'}</small>
                </span>
                {assunto && <ChevronRight size={16} color="var(--muted)" />}
              </>
            );
            return (
              <li key={item.rotulo}>
                {assunto ? (
                  <Link href={urlDe({ tipo: 'assunto', tema: tema.id, assunto: assunto.id })} scroll={false} className={painel.itemZona}>
                    {conteudo}
                  </Link>
                ) : (
                  <div className={`${painel.itemZona} ${styles.mapaSemLink}`}>{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <Teoria topicos={pagina.alcance} />

      <LinhaDoTempo titulo="Linha do tempo" eventos={pagina.linhaDoTempo} />

      <div>
        <h3 className={painel.sectionTitle}>Letra da lei</h3>
        {pagina.dispositivos.map((id) => (
          <TextoDispositivo key={id} id={id} />
        ))}
      </div>

      <BlocoFontes dispositivos={pagina.dispositivos} enquadramentos={SEM_ENQUADRAMENTOS} />
      <p className={styles.quadroNota}>Norma principal: {NORMAS[pagina.norma].titulo}.</p>
      <Aviso />
    </>
  );
}
