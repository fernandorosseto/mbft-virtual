import { normalizar } from './texto';

/**
 * Palavras do dia a dia que o agente digita e o termo que o MBFT usa. A busca procura pelos dois.
 * Chave e valores sem acento e em minúsculas (como a busca compara). Valor de mais de uma palavra
 * é uma frase: as palavras precisam aparecer juntas e nessa ordem ("descarga livre" não acha
 * "carga e descarga"). Prefira a frase ao termo solto quando o termo tem outro sentido no manual.
 * Só termos que existem no texto das fichas (conferido por `npm run verificar:dados`), e o próprio
 * termo digitado já busca pelo começo da palavra (não precisa repetir "pneus" para "pneu").
 */
export const SINONIMOS: Record<string, string[]> = {
  insulfilm: ['pelicula'],
  insufilm: ['pelicula'],
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
  grau: ['manobra perigosa', 'malabarismo', 'equilibrando'],
  empinar: ['malabarismo', 'equilibrando'],
  celular: ['telefone'],
  smartphone: ['telefone'],
  fone: ['fones'],
  carteira: ['cnh', 'habilitacao'],
  habilitacao: ['cnh', 'ppd', 'acc'],
  permissao: ['ppd'],
  // "licenciado" sozinho achava o transporte remunerado "não licenciado para esse fim"
  ipva: ['devidamente licenciado', 'licenciamento anual'],
  documento: ['crlv'],
  documentos: ['crlv'],
  licenciamento: ['licenciado'],
  guincho: ['remocao'],
  cadeirinha: ['dispositivo de retencao'],
  menor: ['crianca'],
  moto: ['motocicleta', 'motoneta'],
  motoqueiro: ['motocicleta'],
  bike: ['bicicleta', 'ciclista'],
  ciclista: ['bicicleta'],
  pcd: ['deficiencia'],
  deficiente: ['deficiencia'],
  idosos: ['idoso'],
  // "luz" sozinha achava também a luz indicadora (seta)
  farol: ['farois', 'luz alta', 'luz baixa', 'facho'],
  apagado: ['acesa'],
  apagada: ['acesa'],
  queimada: ['lampadas queimadas'],
  pisca: ['pisca alerta', 'luz indicadora', 'intermitente'],
  seta: ['luz indicadora'],
  semaforo: ['sinal vermelho'],
  vermelho: ['sinal vermelho'],
  pare: ['parada obrigatoria'],
  // "velocidade" sozinha achava também "reduzir a velocidade"
  radar: ['velocidade superior', 'medidor de velocidade', 'antirradar'],
  velocidade: ['veloc'],
  // "descarga" sozinha achava "carga e descarga"
  escapamento: ['descarga livre', 'silenciador'],
  // "volume" e "sonoro" achavam "transportar volume" e "alarme sonoro" de veículo de urgência
  som: ['aparelhagem sonora'],
  buzinar: ['buzina'],
  calcada: ['passeio'],
  balanca: ['pesagem', 'excesso de peso'],
  sobrepeso: ['excesso de peso'],
  aplicativo: ['transporte remunerado'],
  uber: ['transporte remunerado'],
  pirata: ['transporte remunerado'],
  clandestino: ['transporte remunerado'],
  mototaxi: ['mototaxista'],
  motoboy: ['motofrete', 'transp remun mercadoria'],
  // "coletivo" sozinho achava qualquer menção a transporte coletivo de passageiros em outras fichas
  onibus: ['transporte coletivo'],
  // "cobrança" sozinha achava "cobrança de tarifa" (759-50)
  pedagio: ['pelo uso de rodovias'],
  // "evadir" achava a evasão de pedágio
  fuga: ['fugir', 'acao policial'],
  tacografo: ['cronotacografo', 'registrador instan'],
  careca: ['banda de rodagem', 'indicadores de desgaste'],
  carreta: ['semirreboque'],
  patinete: ['autopropelido'],
  cinquentinha: ['ciclomotor'],
  rebaixado: ['caracteristica alterada'],
  tunado: ['caracteristica alterada'],
  vidro: ['para brisa'],
  parabrisa: ['para brisa'],
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
