import type { Assunto, Tema } from '@/types/conteudo';
import { peliculas } from './peliculas';
import { danos } from './danos';
import { danosPesados } from './danosPesados';
import { vidroSeguranca } from './seguranca';
import { inscricoes } from './inscricoes';
import { medicao } from './medicao';
import { paginaRes960 } from './pagina';

export const vidros: Tema = {
  id: 'vidros',
  titulo: 'Vidros',
  subtitulo: 'Películas, danos e requisitos dos vidros',
  acesso: 'gratis',
  normas: ['res960', 'res989', 'ctb'],
  assuntos: ['peliculas', 'danos', 'danos-pesados', 'vidro-seguranca', 'inscricoes', 'medicao'],
  pagina: paginaRes960,
};

export const assuntosVidros: Assunto[] = [peliculas, danos, danosPesados, vidroSeguranca, inscricoes, medicao];
