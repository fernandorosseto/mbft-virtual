import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { CalculadoraRodaPneu } from '@/components/CalculadoraRodaPneu';
import { obterFicha } from '@/lib/mbft';
import { metadataDe } from '@/lib/metadados';
import { FONTE_RES916, trecho916 } from '@/lib/res916';
import styles from './rodaPneu.module.css';

export const metadata = metadataDe({
  titulo: 'Calculadora roda/pneu (Res. CONTRAN 916/2022) | MBFT Virtual',
  descricao:
    'Confere se o diâmetro do conjunto roda/pneu instalado está dentro da tolerância de ± 3% do original (Res. CONTRAN nº 916/2022, art. 10, II), em medida métrica ou em polegadas, com checklist e resumo para o auto.',
  caminho: '/ferramentas/roda-pneu',
});

/** Blocos da base legal, na ordem da norma; cada linha é um trecho copiado do DOU. */
const BASE_LEGAL: { titulo: string; refs: string[] }[] = [
  {
    titulo: 'Art. 10: proibições sobre o conjunto roda/pneu',
    refs: [
      'Art. 10, caput',
      'Art. 10, I',
      'Art. 10, I, a',
      'Art. 10, I, b',
      'Art. 10, II',
      'Art. 10, § 2º',
      'Art. 10, § 3º',
      'Art. 10, § 3º, I',
      'Art. 10, § 3º, II',
      'Art. 10, § 3º, III',
    ],
  },
  {
    titulo: 'Art. 8º: suspensão alterada',
    refs: ['Art. 8º, caput', 'Art. 8º, I', 'Art. 8º, I, b', 'Art. 8º, I, c', 'Art. 8º, § 1º'],
  },
  { titulo: 'Art. 4º: autorização prévia', refs: ['Art. 4º, caput', 'Art. 4º, I'] },
  { titulo: 'Art. 17: enquadramento no CTB', refs: ['Art. 17, caput', 'Art. 17, I'] },
];

export default function PaginaRodaPneu() {
  const ficha = obterFicha('661-02');
  return (
    <main className={styles.pagina}>
      <nav className={styles.trilha} aria-label="Navegação">
        <Link href="/">Fichas</Link>
        <span aria-hidden>/</span>
        <span>Calculadora roda/pneu</span>
      </nav>
      <h1>Calculadora roda/pneu</h1>
      <p className={styles.intro}>
        Confere o diâmetro externo do conjunto roda/pneu instalado contra o original de fábrica, com a tolerância de ±
        3% da Res. CONTRAN nº 916/2022, art. 10, II. Aceita medida métrica (265/70 R17) ou em polegadas (33x12,50 R15).
        {ficha && (
          <>
            {' '}
            Ficha relacionada:{' '}
            <Link href={`/fichas/${ficha.codigo}`}>
              {ficha.codigo} ({ficha.tipificacaoResumida.replace(/\.$/, '')})
            </Link>
            .
          </>
        )}
      </p>

      <CalculadoraRodaPneu />

      <section className={styles.base} aria-labelledby="base-legal">
        <h2 id="base-legal">Base legal</h2>
        <p className={styles.nota}>
          Texto da Res. CONTRAN nº 916/2022 como publicado no Diário Oficial da União.{' '}
          <a href={FONTE_RES916} target="_blank" rel="noopener noreferrer">
            Abrir no DOU <ExternalLink aria-hidden size={14} />
          </a>
        </p>
        {BASE_LEGAL.map((b) => (
          <details key={b.titulo}>
            <summary>{b.titulo}</summary>
            {b.refs.map((ref) => (
              <p key={ref} className={styles.norma}>
                {trecho916(ref)}
              </p>
            ))}
          </details>
        ))}
        <details>
          <summary>Como achar a medida original</summary>
          <p>
            Etiqueta na coluna da porta do motorista ou na tampa do tanque, manual do proprietário ou ficha técnica do
            fabricante para a versão do veículo.
          </p>
        </details>
        <details>
          <summary>Como a conta é feita</summary>
          <p>Medida métrica: diâmetro (mm) = aro × 25,4 + 2 × largura × perfil ÷ 100.</p>
          <p>Medida em polegadas (33x12,50 R15): diâmetro (mm) = 33 × 25,4; largura (mm) = 12,50 × 25,4.</p>
          <p>
            Diferença (%) = (instalado − original) ÷ original × 100. Faixa permitida: original × 0,97 a original × 1,03.
          </p>
          <p>
            A conta é teórica, pelo código do pneu: a medida real pode variar alguns milímetros conforme a marca e o
            desgaste.
          </p>
        </details>
      </section>

      <p className={styles.aviso}>
        Ferramenta de apoio. Não substitui a leitura da norma vigente nem o MBFT para o enquadramento.
      </p>
    </main>
  );
}
