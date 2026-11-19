'use client';

import { useId, useState, type CSSProperties } from 'react';
import type { BlocoCelula, Consulta } from '@/lib/figuras';
import styles from './ConsultaTabela.module.css';

/** Situação sem os dois-pontos do fim (como vem do PDF). */
const semDoisPontos = (t: string) => t.replace(/:\s*$/, '');

/**
 * Tabela situação × período (ex.: inscrições da 675-00) como consulta: o agente escolhe a situação
 * do veículo e vê os períodos em cartões, um embaixo do outro. A tabela inteira fica num
 * "Ver a tabela completa", que rola para o lado com a primeira coluna fixa.
 */
export function ConsultaTabela({
  consulta: q,
  pagina,
  recuo = 0,
}: {
  consulta: Consulta;
  pagina: number;
  recuo?: number;
}) {
  const [atual, setAtual] = useState(0);
  const id = useId();
  const linha = q.linhas[atual];
  return (
    <div className={styles.consulta} style={{ '--recuo': `${recuo}px` } as CSSProperties}>
      <label htmlFor={id} className={styles.rotulo}>
        Situação do veículo
      </label>
      <select id={id} className={styles.seletor} value={atual} onChange={(e) => setAtual(Number(e.target.value))}>
        {q.linhas.map((l, i) => (
          <option key={i} value={i}>
            {semDoisPontos(l.situacao)}
          </option>
        ))}
      </select>

      <ol className={styles.cartoes} aria-live="polite">
        {q.colunas.map((c, k) => (
          <li key={k} className={styles.cartao}>
            <div className={styles.topo}>
              <span className={styles.periodo}>{c.periodo}</span>
              <span className={styles.resolucao}>
                {q.cantoColunas} {c.resolucao}
              </span>
            </div>
            <Celula blocos={linha.celulas[k]} />
          </li>
        ))}
      </ol>

      <details className={styles.completa}>
        <summary>Ver a tabela completa</summary>
        <div className={styles.rolagem} tabIndex={0} role="region" aria-label="Tabela completa (rola para o lado)">
          <table>
            <colgroup>
              <col style={{ width: 112 }} />
              {q.colunas.map((_, k) => (
                <col key={k} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{q.cantoColunas}</th>
                {q.colunas.map((c, k) => (
                  <th key={k} scope="col" className={styles.resolucaoTh}>
                    {c.resolucao}
                  </th>
                ))}
              </tr>
              <tr>
                <th scope="col" className={styles.canto}>
                  {q.cantoLinhas}
                </th>
                {q.colunas.map((c, k) => (
                  <th key={k} scope="col" className={styles.periodoTh}>
                    {c.periodo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.linhas.map((l, i) => (
                <tr key={i}>
                  <th scope="row">{l.situacao}</th>
                  {l.celulas.map((cel, k) => (
                    <td key={k}>
                      <Celula blocos={cel} compacta />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.dica}>
          Arraste para o lado para ver todos os períodos. Tabela do PDF oficial, a partir da pág. {pagina}.
        </p>
      </details>
    </div>
  );
}

function Celula({ blocos, compacta }: { blocos: BlocoCelula[]; compacta?: boolean }) {
  return (
    <div className={compacta ? styles.celulaCompacta : styles.celula}>
      {blocos.map((b, i) => (
        <div key={i} className={`${styles.bloco} ${b.titulo ? '' : styles.solto}`}>
          {b.titulo && <span className={styles.titulo}>{b.titulo}</span>}
          <ul className={styles.itens}>
            {b.itens.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
