import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { paginaDeTabela, paginasDeTabela } from '@/lib/figuras';
import { obterFicha } from '@/lib/mbft';
import { metadataDe } from '@/lib/metadados';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './tabela.module.css';

// Tabela longa demais para a ficha (várias páginas do PDF): recortes das páginas, sem transcrição
export const dynamicParams = false;

export function generateStaticParams() {
  return paginasDeTabela().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = paginaDeTabela((await params).slug);
  if (!p) return {};
  return metadataDe({
    titulo: `${p.titulo} | MBFT Virtual`,
    descricao: `${p.titulo}: tabela das fichas ${p.fichas.join(' e ')} do Manual Brasileiro de Fiscalização de Trânsito, recortada do PDF oficial.`,
    caminho: `/tabela/${p.slug}`,
  });
}

export default async function PaginaTabela({ params }: Props) {
  const p = paginaDeTabela((await params).slug);
  if (!p) notFound();
  const fichas = p.fichas.map((c) => obterFicha(c)).filter((f) => f !== undefined);
  const primeira = p.imagens[0].pagina;
  const ultima = p.imagens[p.imagens.length - 1].pagina;
  return (
    <main className={styles.pagina}>
      <nav className={styles.trilha} aria-label="Navegação">
        <Link href="/">Fichas</Link>
        {fichas.map((f) => (
          <span key={f.codigo} className={styles.trilhaItem}>
            <span aria-hidden>/</span>
            <Link href={`/fichas/${f.codigo}`}>Voltar à ficha {f.codigo}</Link>
          </span>
        ))}
      </nav>
      <h1>{p.titulo}</h1>
      <p className={styles.intro}>
        Tabela das informações complementares {fichas.length > 1 ? 'das fichas' : 'da ficha'}{' '}
        {fichas.map((f, i) => (
          <span key={f.codigo}>
            {i > 0 && (i === fichas.length - 1 ? ' e ' : ', ')}
            <Link href={`/fichas/${f.codigo}`}>
              {f.codigo} ({f.tipificacaoResumida.replace(/\.$/, '')})
            </Link>
          </span>
        ))}
        . Recorte das páginas {primeira} a {ultima} do PDF oficial, sem alteração. Toque numa página para ampliar.
      </p>

      {p.imagens.map((img) => (
        <figure key={img.arquivo} className={styles.folha}>
          <a href={img.arquivo} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem estática já otimizada (WebP), sem servidor de imagens */}
            <img
              src={img.arquivo}
              width={img.largura}
              height={img.altura}
              loading={img === p.imagens[0] ? 'eager' : 'lazy'}
              decoding="async"
              alt={`${p.titulo}, página ${img.pagina} do PDF oficial`}
            />
          </a>
          <figcaption>Pág. {img.pagina}</figcaption>
        </figure>
      ))}

      <p className={styles.fonte}>
        <a href={`${URL_MBFT_OFICIAL}#page=${primeira}`} target="_blank" rel="noopener noreferrer">
          Abrir no PDF oficial, pág. {primeira} <ExternalLink aria-hidden size={14} />
        </a>
      </p>
    </main>
  );
}
