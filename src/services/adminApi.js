import { api } from './api';

// Normaliza registros vindos de endpoints distintos para um formato único
const normalize = (item, tipoFallback) => ({
  id: item.id ?? item.uuid ?? item._id ?? `${tipoFallback}-${Math.random().toString(36).slice(2)}`,
  tipo: item.tipo || tipoFallback,
  setor: item.setor || 'Geral',
  contato: item.contato || item.email || 'N/A',
  dataCriacao: item.dataCriacao || item.createdAt || new Date().toISOString(),
  status: item.status || 'Pendente',
  descricao: item.descricao || item.mensagem || '',
  respostaAdmin: item.respostaAdmin || item.resposta || undefined,
});

export async function listarTodasManifestacoes() {
  // Admin precisa ler todos; alguns endpoints exigem ADMIN
  const reqs = [
    api.get('/reclamacoes').catch(() => []),
    api.get('/denuncias').catch(() => []),
    api.get('/elogios').catch(() => []),
    api.get('/sugestoes').catch(() => []),
  ];
  const [reclamacoes, denuncias, elogios, sugestoes] = await Promise.all(reqs);
  const flat = [
    ...(Array.isArray(reclamacoes) ? reclamacoes.map(i => normalize(i, 'Reclamação')) : []),
    ...(Array.isArray(denuncias) ? denuncias.map(i => normalize(i, 'Denúncia')) : []),
    ...(Array.isArray(elogios) ? elogios.map(i => normalize(i, 'Elogio')) : []),
    ...(Array.isArray(sugestoes) ? sugestoes.map(i => normalize(i, 'Sugestão')) : []),
  ];
  // Ordena por data desc
  flat.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
  return flat;
}
