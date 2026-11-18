import Link from 'next/link';
import { DesenhoGrafo, tamanhoDoNo, type NoDesenho } from './DesenhoGrafo';
import { citacoes, conexoes, obterFicha, type Ficha } from '@/lib/mbft';
import { posicionarComAltura } from '@/lib/grafo';
import styles from './ConexoesFicha.module.css';
import { Ref } from './Ref';

/** Duas versões do mesmo grafo: larga no computador, estreita no celular (rótulos legíveis nos dois). */
const FORMATOS = [
  { largura: 680, minimo: 320, maximo: 720, classe: styles.pc },
  { largura: 360, minimo: 360, maximo: 1100, classe: styles.celular },
];

/** Grafo local da ficha (estilo Obsidian) e as listas de fichas que ela cita e que a citam. */
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
        Toque numa bolinha para abrir a ficha.
      </p>
      {FORMATOS.map((formato) => {
        const base = ids.map((id) => {
          const f = obterFicha(id)!;
          return {
            id,
            artigo: f.rotuloArtigo,
            tema: f.tema,
            gravidade: f.gravidade,
            papel: (id === ficha.codigo ? 'centro' : 'principal') as NoDesenho['papel'],
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
        const nos: NoDesenho[] = base.map((b) => ({ ...b, x: pos.get(b.id)!.x, y: pos.get(b.id)!.y }));
        return (
          <DesenhoGrafo
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

      <div className={styles.listas}>
        <Lista titulo="Esta ficha cita" fichas={cita} />
        <Lista titulo="É citada por" fichas={citadaPor} />
      </div>
    </section>
  );
}

function Lista({ titulo, fichas }: { titulo: string; fichas: Ficha[] }) {
  return (
    <div>
      <h3>
        {titulo} <span className={styles.qtd}>{fichas.length}</span>
      </h3>
      {fichas.length ? (
        <ul>
          {fichas.map((f) => (
            <li key={f.codigo}>
              <Link href={`/fichas/${f.codigo}`}>
                <b>
                  <Ref codigo={f.codigo} artigo={f.rotuloArtigo} />
                </b>{' '}
                {f.tipificacaoResumida}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.nenhuma}>Nenhuma.</p>
      )}
    </div>
  );
}
