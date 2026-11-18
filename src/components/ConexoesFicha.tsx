import Link from 'next/link';
import { DesenhoGrafo, type NoDesenho } from './DesenhoGrafo';
import { citacoes, conexoes, obterFicha, type Ficha } from '@/lib/mbft';
import { posicionar } from '@/lib/grafo';
import styles from './ConexoesFicha.module.css';

/** Duas versões do mesmo grafo: larga no computador, alta no celular (rótulos legíveis nos dois). */
const FORMATOS = [
  { largura: 680, altura: 360, classe: styles.pc },
  { largura: 360, altura: 400, classe: styles.celular },
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
        Fichas ligadas a esta por citação de código. Toque numa bolinha para abrir a ficha.
      </p>
      {FORMATOS.map((formato) => {
        const pos = posicionar(ids, arestas, { ...formato, centro: ficha.codigo });
        const nos: NoDesenho[] = ids.map((id) => {
          const f = obterFicha(id)!;
          return {
            id,
            x: pos.get(id)!.x,
            y: pos.get(id)!.y,
            gravidade: f.gravidade,
            papel: id === ficha.codigo ? 'centro' : 'principal',
            titulo: `${f.codigo} · ${f.tipificacaoResumida}`,
            href: id === ficha.codigo ? undefined : `/fichas/${id}`,
          };
        });
        return (
          <DesenhoGrafo
            key={formato.largura}
            nos={nos}
            arestas={arestas}
            largura={formato.largura}
            altura={formato.altura}
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
                <b>{f.codigo}</b> {f.tipificacaoResumida}
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
