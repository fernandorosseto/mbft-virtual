'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { ASSUNTOS, TEMAS, TEMAS_FUTUROS, assuntosDoTema } from '@/data/conteudo';
import { assuntoPublicado, urlDe } from '@/lib/navegacao';
import { ListaDeEspera } from './ListaDeEspera';
import painel from './InfoPanel.module.css';
import styles from './Introducao.module.css';

/**
 * Painel da tela inicial: por que a legislação de trânsito pesa na prova da PRF (números dos
 * editais em docs/editais/) e o que já está disponível.
 */
export function Introducao() {
  const primeiro = Object.values(ASSUNTOS).find(assuntoPublicado);
  const disponiveis = Object.values(TEMAS);

  return (
    <>
      <p className={painel.lead}>
        No último concurso da PRF, a legislação de trânsito foi um bloco próprio da prova objetiva, com nota
        mínima e peso no desempate. Aqui você estuda as resoluções do edital sobre o veículo: escolha um assunto
        e veja no carro onde cada regra se aplica.
      </p>

      {primeiro && (
        <Link href={urlDe({ tipo: 'assunto', tema: primeiro.tema, assunto: primeiro.id })} scroll={false} className={styles.cta}>
          <span>Começar por {primeiro.titulo}</span>
          <ArrowRight size={18} />
        </Link>
      )}

      <div className={styles.numeros}>
        <div className={styles.numero}>
          <b>30 de 120</b>
          <span>itens da prova objetiva no Bloco II, Legislação de Trânsito (2021). Em 2018 foram 40.</span>
        </div>
        <div className={styles.numero}>
          <b>&lt; 10</b>
          <span>nota no Bloco II que eliminava o candidato em 2021 (12 em 2018).</span>
        </div>
        <div className={styles.numero}>
          <b>Desempate</b>
          <span>maior nota e mais acertos no Bloco II vêm logo depois da preferência ao idoso.</span>
        </div>
        <div className={styles.numero}>
          <b>C ou E</b>
          <span>itens de Certo ou Errado: um erro anula um acerto.</span>
        </div>
      </div>

      <div>
        <h3 className={painel.sectionTitle}>O que tem aqui</h3>
        <ul className={styles.temas}>
          {disponiveis.map((t) => (
            <li key={t.id}>
              <span className={styles.temaNome}>
                <b>{t.titulo}</b>
                <small>
                  {assuntosDoTema(t.id)
                    .filter(assuntoPublicado)
                    .map((a) => a.tituloCurto ?? a.titulo)
                    .join(', ')}{' '}
                  · disponível
                </small>
              </span>
              <span className={styles.gratis}>Grátis</span>
            </li>
          ))}
          {TEMAS_FUTUROS.map((t) => (
            <li key={t.id} className={styles.futuro}>
              <span className={styles.temaNome}>
                <b>{t.titulo}</b>
                <small>{t.normaPrevista} · em breve</small>
              </span>
              {t.acesso === 'gratis' ? (
                <span className={styles.gratis}>Grátis</span>
              ) : (
                <span className={styles.pago}>
                  <Lock size={11} />
                  Completo
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ListaDeEspera />

      <p className={painel.disclaimer}>
        Site independente, sem vínculo com a Polícia Rodoviária Federal nem com a banca. Números do Edital nº 1/2021
        (DOU de 19/01/2021) e do Edital nº 1 - PRF, de 27/11/2018. Conteúdo informativo. Não substitui o texto publicado no Diário
        Oficial da União.
      </p>
    </>
  );
}
