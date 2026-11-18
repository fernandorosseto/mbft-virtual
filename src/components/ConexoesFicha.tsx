import { GrafoVivo } from './GrafoVivo';
import { tamanhoDoNo, type NoGrafo } from '@/lib/noGrafo';
import { citacoes, conexoes, obterFicha, type Ficha } from '@/lib/mbft';
import { posicionarComAltura } from '@/lib/grafo';
import styles from './ConexoesFicha.module.css';
import { LigacoesFicha } from './LigacoesFicha';

/** Duas versões do mesmo grafo: larga no computador, estreita no celular (rótulos legíveis nos dois). */
const FORMATOS = [
  { largura: 680, minimo: 320, maximo: 720, classe: styles.pc },
  { largura: 360, minimo: 360, maximo: 1100, classe: styles.celular },
];

/** Grafo local da ficha (estilo Obsidian) e as ligações pelo sentido (LigacoesFicha). */
export function ConexoesFicha({ ficha }: { ficha: Ficha }) {
  const { cita, citadaPor } = conexoes(ficha.codigo);
  if (!cita.length && !citadaPor.length) return null;

  const ids = [ficha.codigo, ...new Set([...cita, ...citadaPor].map((f) => f.codigo))];
  const presentes = new Set(ids);
  // Também as citações entre os vizinhos, como no grafo local do Obsidian
  const arestas = citacoes().filter(([a, b]) => presentes.has(a) && presentes.has(b));

  return (
    <section className={styles.conexoes} aria-labelledby="conexoes">
      <h2 id="conexoes">Conexões</h2>
      <p className={styles.legenda}>
        Fichas ligadas a esta por citação de código. A linha amarela corre de quem cita para a ficha citada.
        Arraste as bolinhas; toque para abrir a ficha. Zoom pelos botões, com Ctrl + roda ou em tela cheia.
      </p>
      {FORMATOS.map((formato) => {
        const base = ids.map((id) => {
          const f = obterFicha(id)!;
          return {
            id,
            artigo: f.rotuloArtigo,
            tema: f.tema,
            gravidade: f.gravidade,
            papel: (id === ficha.codigo ? 'centro' : 'principal') as NoGrafo['papel'],
            titulo: `${f.codigo} · ${f.rotuloArtigo} · ${f.tipificacaoResumida}`,
            href: id === ficha.codigo ? undefined : `/fichas/${id}`,
          };
        });
        const tamanhos = new Map(base.map((b) => [b.id, tamanhoDoNo(b)]));
        const { pos, altura } = posicionarComAltura(ids, arestas, {
          largura: formato.largura,
          minimo: formato.minimo,
          maximo: formato.maximo,
          centro: ficha.codigo,
          tamanhos,
        });
        const nos: NoGrafo[] = base.map((b) => ({ ...b, x: pos.get(b.id)!.x, y: pos.get(b.id)!.y }));
        return (
          <GrafoVivo
            key={formato.largura}
            nos={nos}
            arestas={arestas}
            largura={formato.largura}
            altura={altura}
            rotulo={`Grafo de conexões da ficha ${ficha.codigo}`}
            className={formato.classe}
          />
        );
      })}

      <LigacoesFicha ficha={ficha} />
    </section>
  );
}
