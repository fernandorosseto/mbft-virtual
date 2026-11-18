import { Catalogo, type GrupoCatalogo } from '@/components/Catalogo';
import { fichasPorArtigo, todasAsFichas } from '@/lib/mbft';
import styles from './page.module.css';

export default function Inicio() {
  const grupos: GrupoCatalogo[] = fichasPorArtigo().map((g) => ({
    artigo: g.artigo,
    itens: g.fichas.map((f) => ({
      codigo: f.codigo,
      resumo: f.tipificacaoResumida,
      amparo: f.amparoLegal,
      gravidade: f.gravidade,
    })),
  }));

  return (
    <main className={styles.conteudo}>
      <section className={styles.abertura}>
        <h1>Fichas de fiscalização</h1>
        <p>
          Consulta às fichas do MBFT (anexo da Resolução CONTRAN nº 985/2022): enquadramento, quando autuar, quando não
          autuar e procedimentos.
        </p>
      </section>
      <Catalogo grupos={grupos} total={todasAsFichas().length} />
    </main>
  );
}
