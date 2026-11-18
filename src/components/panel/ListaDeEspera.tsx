'use client';

import React, { useState } from 'react';
import { BellRing, Check } from 'lucide-react';
import styles from './Introducao.module.css';

type Situacao = { tipo: 'livre' } | { tipo: 'enviando' } | { tipo: 'ok' } | { tipo: 'erro'; mensagem: string };

/** Formulário da lista de espera (POST /api/lista-espera). */
export function ListaDeEspera() {
  const [email, setEmail] = useState('');
  const [situacao, setSituacao] = useState<Situacao>({ tipo: 'livre' });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSituacao({ tipo: 'enviando' });
    try {
      const resposta = await fetch('/api/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, origem: 'inicio' }),
      });
      const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro ?? 'Não foi possível registrar agora. Tente de novo mais tarde.');
      setSituacao({ tipo: 'ok' });
    } catch (erro) {
      setSituacao({ tipo: 'erro', mensagem: erro instanceof Error ? erro.message : 'Erro inesperado.' });
    }
  };

  return (
    <section className={styles.espera} aria-labelledby="lista-espera-titulo">
      <h3 id="lista-espera-titulo" className={styles.esperaTitulo}>
        <BellRing size={18} />
        <span>Avise-me das novidades</span>
      </h3>
      <p className={styles.esperaTexto}>
        Receba um e-mail quando novas resoluções forem publicadas e quando a versão completa abrir, com preço de
        lançamento para quem estiver na lista.
      </p>
      {situacao.tipo === 'ok' ? (
        <p className={styles.esperaOk} role="status">
          <Check size={16} />
          <span>Pronto. Você está na lista.</span>
        </p>
      ) : (
        <form className={styles.esperaForm} onSubmit={enviar}>
          <label htmlFor="lista-espera-email" className={styles.somenteLeitor}>
            E-mail
          </label>
          <input
            id="lista-espera-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.esperaCampo}
          />
          <button type="submit" className={styles.esperaBotao} disabled={situacao.tipo === 'enviando'}>
            {situacao.tipo === 'enviando' ? 'Enviando...' : 'Quero ser avisado'}
          </button>
        </form>
      )}
      {situacao.tipo === 'erro' && (
        <p className={styles.esperaErro} role="alert">
          {situacao.mensagem}
        </p>
      )}
      <p className={styles.esperaPrivacidade}>
        Usamos o e-mail só para avisos do CTB Virtual, sem repassar a terceiros. Para sair da lista, responda a
        qualquer aviso.
      </p>
    </section>
  );
}
