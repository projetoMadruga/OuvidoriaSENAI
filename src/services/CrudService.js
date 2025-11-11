const TIPOS_MANIFESTACAO = {
  RECLAMACAO: 'Reclamação',
  DENUNCIA: 'Denúncia',
  ELOGIO: 'Elogio', 
  SUGESTAO: 'Sugestão' 
};

const STATUS_MANIFESTACAO = {
    PENDENTE: 'Pendente',
    EM_ANALISE: 'Em Analise',
    RESOLVIDO: 'Resolvido',
    ARQUIVADO: 'Arquivado',
};

const STORAGE_KEY = 'manifestacoes';

const gerarId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const getAll = () => {
  const manifestacoes = localStorage.getItem(STORAGE_KEY);
 
  const lista = manifestacoes ? JSON.parse(manifestacoes) : [];
  
  
  return lista.map((m) => ({
      id: m.id || gerarId(), 
      ...m
  }));
};

const getByEmail = (email) => {
  const manifestacoes = getAll();
 
  return manifestacoes.filter(item => item.contato === email);
};

const getByTipo = (tipo) => {
  const manifestacoes = getAll();
  return manifestacoes.filter(item => item.tipo === tipo);
};

const getById = (id) => {
  const manifestacoes = getAll();
 
  return manifestacoes.find(item => String(item.id) === String(id));
};

const create = (manifestacao) => {
  const manifestacoes = getAll();
  
  const novaManifestacao = {
    ...manifestacao,
    id: gerarId(),
    
    dataCriacao: new Date().toISOString(), 
    status: STATUS_MANIFESTACAO.PENDENTE, 
    visibilidade: 'admin', 
   
    usuarioEmail: manifestacao.contato || 'anonimo@senai.br'
  };
  

  manifestacoes.push(novaManifestacao);

 
  const manifestacoesToSave = manifestacoes.map(({ id, ...rest }) => rest);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(manifestacoesToSave));
  
  return novaManifestacao;
};


const updateManifestacao = (id, dadosAtualizados) => {
  const manifestacoes = getAll();
  
  
  const index = manifestacoes.findIndex(item => String(item.id) === String(id)); 
  
  if (index === -1) return null;
  
  const manifestacaoAtualizada = {
    ...manifestacoes[index],
    ...dadosAtualizados,
    dataAtualizacao: new Date().toISOString()
  };
  
  manifestacoes[index] = manifestacaoAtualizada;
  
  
  const manifestacoesToSave = manifestacoes.map(({ id: itemID, ...rest }) => rest);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manifestacoesToSave));
  
 
  return manifestacaoAtualizada;
};


const updateManifestacoes = (listaManifestacoesAtualizada) => {
    
    const manifestacoesToSave = listaManifestacoesAtualizada.map(({ id, ...rest }) => rest);
    
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manifestacoesToSave));
};


const remove = (id) => {
  const manifestacoes = getAll();
  const novaLista = manifestacoes.filter(item => String(item.id) !== String(id)); 
  
  if (novaLista.length === manifestacoes.length) return false;
  
 
  const manifestacoesToSave = novaLista.map(({ id: itemID, ...rest }) => rest);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(manifestacoesToSave));
  return true;
};


const getVisibleForUser = (userType) => {
  const manifestacoes = getAll();
  
  if (userType === 'Administrador') {
    return manifestacoes;
  }
  
 
  return manifestacoes.filter(item => 
    item.visibilidade === 'todos' || 
 
    (userType.toLowerCase() === 'funcionario' && item.visibilidade === 'admin') || 
    item.visibilidade === userType.toLowerCase()
  );
};

const changeVisibility = (id, visibilidade) => {
  const manifestacoes = getAll();
  const index = manifestacoes.findIndex(item => String(item.id) === String(id)); 
  
  if (index === -1) return false;
  
  manifestacoes[index].visibilidade = visibilidade;
  
  const manifestacoesToSave = manifestacoes.map(({ id: itemID, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manifestacoesToSave));
  
  return true;
};


const CrudService = {
  TIPOS_MANIFESTACAO,
  STATUS_MANIFESTACAO,
  getAll,
  getByTipo,
  getById,
  getByEmail,
  getVisibleForUser,
  changeVisibility,
  create,
  update: updateManifestacao, 
  updateManifestacoes,
  remove
};

export default CrudService;
