'use client';

import React from 'react';
import {
  AlertOctagon,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  X,
  XCircle,
} from 'lucide-react';
import type { ConteudoEssencial, ConteudoProva, Destaque, Enquadramento } from '@/types/conteudo';
import { INFRACOES, type DispositivoId } from '@/data/conteudo';
import { obterDispositivo as disp } from '@/data/normas/dispositivos';
import { fontesDe } from '@/lib/fontes';
import styles from './InfoPanel.module.css';

/**
 * Blocos do conteúdo normativo, compostos pela ficha (rolagem única) e pelas abas do assunto.
 * Ordem do padrão de conteúdo: PLANO.md, seção 3.4.
 */

export const AVISO_DOU = 'Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União.';

/** Texto com **negrito** (dois asteriscos). */
export function TextoRico({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </>
  );
}

export function BlocoDestaque({ destaque }: { destaque: Destaque }) {
  return (
    <div className={styles.bigCard}>
      <div className={`${styles.bigNumber} ${destaque.valor.length > 6 ? styles.bigNumberLongo : ''}`}>{destaque.valor}</div>
      <div className={styles.bigLabel}>{destaque.rotulo}</div>
      <div className={styles.bigSublabel}>{destaque.detalhe}</div>
    </div>
  );
}

export function BlocoEssencial({ essencial }: { essencial: ConteudoEssencial }) {
  return (
    <>
      <div>
        <h3 className={styles.sectionTitle}>Em resumo</h3>
        <p className={styles.text}>{essencial.explicacao}</p>
      </div>
      {essencial.pode.length > 0 && <ListaRegras titulo="Pode" itens={essencial.pode} tipo="ok" />}
      {essencial.naoPode.length > 0 && <ListaRegras titulo="Não pode" itens={essencial.naoPode} tipo="bad" />}
    </>
  );
}

export function BlocoProva({ prova }: { prova: ConteudoProva }) {
  const total = prova.pontosDeProva.length + (prova.historico?.length ?? 0) + (prova.atencao?.length ?? 0);
  if (total === 0) return null;
  const lista = (itens: string[]) => (
    <ul className={styles.examList}>
      {itens.map((p, i) => (
        <li key={i} className={styles.examItem}>
          <TextoRico texto={p} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={styles.examBox}>
      <div className={styles.examTitle}>
        <GraduationCap size={18} />
        <span>Pontos de prova</span>
      </div>
      {lista(prova.pontosDeProva)}
      {prova.historico && prova.historico.length > 0 && (
        <>
          <h4 className={styles.examSubtitulo}>Histórico da redação</h4>
          {lista(prova.historico)}
        </>
      )}
      {prova.atencao && prova.atencao.length > 0 && (
        <>
          <h4 className={styles.examSubtitulo}>Atenção: pontos que a norma não resolve</h4>
          {lista(prova.atencao)}
        </>
      )}
    </div>
  );
}

/** Letra da lei: dispositivos vigentes, tipificação no CTB e redação anterior. */
export function BlocoLei({ dispositivos, enquadramentos }: { dispositivos: DispositivoId[]; enquadramentos: Enquadramento[] }) {
  const vigentes = dispositivos.filter((id) => !disp(id).revogadoPor);
  const revogados = dispositivos.filter((id) => disp(id).revogadoPor);
  const tipificacoes = Array.from(new Set(enquadramentos.map((e) => INFRACOES[e.infracao].dispositivo)));
  return (
    <div>
      <h3 className={styles.sectionTitle}>
        <BookOpen size={18} />
        <span>Letra da lei</span>
      </h3>
      {[...vigentes, ...tipificacoes.filter((t) => !vigentes.includes(t))].map((id) => (
        <TextoDispositivo key={id} id={id} />
      ))}
      {revogados.length > 0 && (
        <>
          <h4 className={styles.subtituloLei}>Redação anterior (não está mais em vigor)</h4>
          {revogados.map((id) => (
            <TextoDispositivo key={id} id={id} revogado />
          ))}
        </>
      )}
    </div>
  );
}

export function BlocoFiscalizacao({ itens }: { itens?: string[] }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div>
      <h3 className={styles.sectionTitle}>
        <ClipboardCheck size={18} color="var(--sign-text)" />
        <span>Na fiscalização</span>
      </h3>
      <ul className={styles.rulesList}>
        {itens.map((item, i) => (
          <li key={i} className={styles.rulesItem}>
            <span className={styles.ruleMarkerOk}>
              <Check size={13} strokeWidth={2.5} />
            </span>
            <span>
              <TextoRico texto={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlocoInfracoes({ enquadramentos }: { enquadramentos: Enquadramento[] }) {
  const infracoes = Array.from(new Set(enquadramentos.map((e) => e.infracao)));
  if (infracoes.length === 0) return null;
  return (
    <div>
      <h3 className={styles.sectionTitle}>
        <AlertOctagon size={18} color="var(--bad)" />
        <span>Infração e penalidade</span>
      </h3>
      {infracoes.map((id) => {
        const inf = INFRACOES[id];
        const situacoes = enquadramentos.filter((e) => e.infracao === id);
        return (
          <div key={id} className={styles.blocoInfracao}>
            <div className={styles.penaltyGrid}>
              <div className={styles.penaltyCell}>
                <small>Natureza</small>
                <b>{inf.natureza}</b>
              </div>
              <div className={styles.penaltyCell}>
                <small>Pontos</small>
                <b>{inf.pontos}</b>
              </div>
              <div className={styles.penaltyCell}>
                <small>Multa</small>
                <b>{inf.valor}</b>
              </div>
              <div className={styles.penaltyCell}>
                <small>Medida</small>
                <b>Retenção</b>
              </div>
            </div>
            <p className={styles.penaltyDetail}>
              {disp(inf.dispositivo).rotulo}. {inf.medida}.
            </p>
            <ul className={styles.listaSituacoes}>
              {situacoes.map((s) => (
                <li key={s.situacao}>
                  {s.situacao}
                  {s.base && <small> ({disp(s.base).rotulo})</small>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function BlocoFontes({ dispositivos, enquadramentos }: { dispositivos: DispositivoId[]; enquadramentos: Enquadramento[] }) {
  const fontes = fontesDe(dispositivos, enquadramentos);
  return (
    <div>
      <h3 className={styles.sectionTitle}>Fontes oficiais e créditos</h3>
      <ul className={styles.sourcesList}>
        {fontes.map((f) => (
          <li key={f.url}>
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              {f.rotulo} <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </a>
          </li>
        ))}
        <li>
          Modelo 3D:{' '}
          <a
            href="https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5"
            target="_blank"
            rel="noopener noreferrer"
          >
            Generic passenger car pack
          </a>{' '}
          de{' '}
          <a href="https://sketchfab.com/comrade1280" target="_blank" rel="noopener noreferrer">
            Comrade1280
          </a>
          , sob licença{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>{' '}
          (recortado e adaptado).
        </li>
        <li>
          Caminhão 3D:{' '}
          <a href="https://skfb.ly/pCvqD" target="_blank" rel="noopener noreferrer">
            FORD CARGO MAX TRUCK 2428e - RICK MODDING
          </a>{' '}
          de{' '}
          <a href="https://sketchfab.com/Rick_modding_" target="_blank" rel="noopener noreferrer">
            Rick_modding
          </a>
          , sob licença{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>{' '}
          (adaptado: inscrições da marca removidas, cores trocadas).
        </li>
      </ul>
    </div>
  );
}

export function Aviso() {
  return <p className={styles.disclaimer}>{AVISO_DOU}</p>;
}

function ListaRegras({ titulo, itens, tipo }: { titulo: string; itens: string[]; tipo: 'ok' | 'bad' }) {
  return (
    <div>
      <h3 className={styles.sectionTitle}>
        {tipo === 'ok' ? <CheckCircle2 size={18} color="var(--ok)" /> : <XCircle size={18} color="var(--bad)" />}
        <span>{titulo}</span>
      </h3>
      <ul className={styles.rulesList}>
        {itens.map((item, i) => (
          <li key={i} className={styles.rulesItem}>
            <span className={tipo === 'ok' ? styles.ruleMarkerOk : styles.ruleMarkerBad}>
              {tipo === 'ok' ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
            </span>
            <span>
              <TextoRico texto={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TextoDispositivo({ id, revogado = false }: { id: DispositivoId; revogado?: boolean }) {
  const d = disp(id);
  const pai = d.contexto ? disp(d.contexto as DispositivoId) : null;
  return (
    <blockquote className={`${styles.lawQuote} ${revogado ? styles.lawQuoteRevogada : ''}`}>
      {pai && <span className={styles.lawContexto}>{pai.texto} [...] </span>}
      {d.texto}
      <cite className={styles.lawCite}>
        {d.rotulo}
        {d.redacao && ` · ${d.redacao}`}
        {d.vigencia && ` · ${d.vigencia}`}
      </cite>
    </blockquote>
  );
}
