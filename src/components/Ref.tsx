/**
 * Referência à ficha conforme a preferência "guiar por": `Ref` mostra o código (padrão) ou o
 * artigo; `RefOutra` mostra o outro, para a posição secundária. Só CSS (classes globais
 * so-codigo / so-artigo), então funciona no servidor e no cliente.
 */
export function Ref({ codigo, artigo }: { codigo: string; artigo: string }) {
  return (
    <>
      <span className="so-codigo">{codigo}</span>
      <span className="so-artigo">{artigo}</span>
    </>
  );
}

export function RefOutra({ codigo, artigo }: { codigo: string; artigo: string }) {
  return (
    <>
      <span className="so-codigo">{artigo}</span>
      <span className="so-artigo">{codigo}</span>
    </>
  );
}
