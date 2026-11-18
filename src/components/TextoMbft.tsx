import Link from 'next/link';
import { Fragment } from 'react';
import { existeFicha } from '@/lib/mbft';

const CODIGO = /\b(\d{3}-\d{2})\b/g;

/**
 * Texto do manual com os códigos de enquadramento citados (ex.: 565-70) virando links para a ficha.
 * `atual`: código da ficha aberta, que não vira link.
 */
export function TextoMbft({ texto, atual }: { texto: string; atual?: string }) {
  const partes = texto.split(CODIGO);
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 && p !== atual && existeFicha(p) ? (
          <Link key={i} href={`/fichas/${p}`} className="codigo-link">
            {p}
          </Link>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Item numerado de uma coluna da ficha ("1. ... 1.1. ... 1.2. ..."): separa o número do texto
 * e os subitens, sem mudar o texto.
 */
export function dividirItem(item: string): { numero?: string; texto: string; subitens: { numero: string; texto: string }[] } {
  const [principal, ...resto] = item.split(/\s(?=\d+\.\d+\.\s)/);
  const m = principal.match(/^(\d+)\.\s+([\s\S]*)$/);
  const subitens = resto.map((s) => {
    const sm = s.match(/^(\d+\.\d+\.)\s+([\s\S]*)$/);
    return sm ? { numero: sm[1], texto: sm[2] } : { numero: '', texto: s };
  });
  return m ? { numero: m[1], texto: m[2], subitens } : { texto: principal, subitens };
}
