import { normalizar } from './texto';

/**
 * Palavras do dia a dia que o agente digita e o termo que o MBFT usa. A busca procura pelos dois.
 * Chave e valores sem acento e em minúsculas (como a busca compara). Cada valor pode ter mais de
 * uma palavra ("luz baixa"): todas precisam aparecer. Só termos que existem no texto das fichas
 * (conferido por `npm run verificar:dados`).
 */
export const SINONIMOS: Record<string, string[]> = {
  insulfilm: ['pelicula', 'peliculas'],
  insufilm: ['pelicula', 'peliculas'],
  filme: ['pelicula'],
  bafometro: ['etilometro'],
  bafo: ['etilometro'],
  embriaguez: ['alcool'],
  embriagado: ['alcool'],
  bebado: ['alcool'],
  bebida: ['alcool'],
  alcoolizado: ['alcool'],
  droga: ['psicoativa'],
  drogas: ['psicoativa'],
  racha: ['corrida', 'competicao'],
  pega: ['corrida'],
  grau: ['manobra perigosa', 'malabarismo'],
  empinar: ['malabarismo', 'roda'],
  celular: ['telefone'],
  smartphone: ['telefone'],
  fone: ['fones'],
  carteira: ['cnh', 'habilitacao'],
  habilitacao: ['cnh', 'ppd', 'acc'],
  permissao: ['ppd'],
  ipva: ['licenciado', 'licenciamento'],
  documento: ['crlv', 'documentos'],
  documentos: ['crlv'],
  licenciamento: ['licenciado'],
  guincho: ['remocao'],
  cadeirinha: ['crianca'],
  menor: ['crianca'],
  moto: ['motocicleta', 'motoneta'],
  motoqueiro: ['motocicleta'],
  bike: ['bicicleta', 'ciclista'],
  ciclista: ['bicicleta'],
  pcd: ['deficiencia'],
  deficiente: ['deficiencia'],
  idosos: ['idoso', 'idosos'],
  farol: ['farol', 'farois', 'luz'],
  apagado: ['acesa', 'acesas'],
  apagada: ['acesa', 'acesas'],
  queimada: ['queimadas', 'inoperante'],
  pisca: ['pisca alerta', 'luz indicadora', 'intermitente'],
  seta: ['luz indicadora', 'indicar'],
  semaforo: ['sinal vermelho', 'semaforo'],
  vermelho: ['sinal vermelho'],
  pare: ['parada obrigatoria'],
  radar: ['velocidade', 'medidor'],
  velocidade: ['velocidade', 'veloc'],
  escapamento: ['descarga', 'silenciador'],
  som: ['som', 'volume', 'sonoro'],
  buzinar: ['buzina'],
  calcada: ['passeio', 'calcada'],
  balanca: ['pesagem', 'peso'],
  sobrepeso: ['excesso de peso'],
  aplicativo: ['transporte remunerado'],
  uber: ['transporte remunerado'],
  pirata: ['transporte remunerado'],
  clandestino: ['transporte remunerado'],
  mototaxi: ['mototaxistas', 'mototaxi'],
  motoboy: ['motofrete', 'transp remun mercadoria'],
  onibus: ['coletivo', 'onibus'],
  lotacao: ['lotacao'],
  pedagio: ['cobranca', 'pagamento'],
  fuga: ['fugir', 'evadir'],
  recusa: ['recusar', 'recusa'],
  placa: ['placa', 'placas'],
  chassi: ['chassi'],
  vidro: ['vidros', 'para brisa'],
  parabrisa: ['para brisa'],
  limpador: ['limpador'],
  pneu: ['pneus', 'mau estado'],
};

/**
 * Cada termo da busca vira uma lista de alternativas (cada alternativa, uma lista de palavras que
 * precisam aparecer juntas). Sem sinônimo, a única alternativa é o próprio termo.
 */
export function alternativasDe(termos: string[]): string[][][] {
  return termos.map((t) => {
    const extras = SINONIMOS[t] ?? [];
    return [[t], ...extras.map((e) => normalizar(e).split(' '))];
  });
}
