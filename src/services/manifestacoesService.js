import { api } from './api';

// Função para construir URL (copiada do api.js)
const buildUrl = (path) => {
  const API_BASE = process.env.REACT_APP_API_BASE || "";
  if (!API_BASE) return path; // fallback for local dev
  if (path.startsWith("http")) return path;
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const manifestacoesService = {
  /**
   * Busca todas as manifestações do usuário logado ou todas se for admin
   */
  async listarManifestacoes() {
    try {
      const response = await fetch(buildUrl("/manifestacoes"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar manifestações:", error);
      throw error;
    }
  },

  /**
   * Busca manifestações por tipo (apenas para admins)
   */
  async listarManifestacoesPorTipo(tipo) {
    try {
      const response = await fetch(buildUrl(`/manifestacoes/tipo/${tipo}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar manifestações do tipo ${tipo}:`, error);
      throw error;
    }
  },

  /**
   * Busca uma manifestação específica por ID
   */
  async buscarManifestacaoPorId(id) {
    try {
      const response = await fetch(buildUrl(`/manifestacoes/${id}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar manifestação ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca todos os usuários (apenas para admins)
   */
  async listarUsuarios() {
    try {
      const response = await fetch(buildUrl("/login/usuarios"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  },

  /**
   * Formata o status para exibição
   */
  formatarStatus(status) {
    const statusMap = {
      'PENDENTE': 'Pendente',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDO': 'Resolvida',
      'EM_ANALISE': 'Em Análise',
      'RESOLVIDA': 'Resolvida',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada'
    };
    return statusMap[status] || status;
  },

  /**
   * Converte status formatado de volta para o enum do backend
   */
  converterStatusParaBackend(statusFormatado) {
    const reverseMap = {
      'Pendente': 'PENDENTE',
      'Em Andamento': 'EM_ANDAMENTO',
      'Resolvida': 'CONCLUIDO',
      'Em Análise': 'PENDENTE',
      'Finalizada': 'CONCLUIDO',
      'Cancelada': 'CANCELADA'
    };
    return reverseMap[statusFormatado] || statusFormatado;
  },

  /**
   * Formata o tipo para exibição
   */
  formatarTipo(tipo) {
    const tipoMap = {
      'RECLAMACAO': 'Reclamação',
      'DENUNCIA': 'Denúncia',
      'ELOGIO': 'Elogio',
      'SUGESTAO': 'Sugestão'
    };
    return tipoMap[tipo] || tipo;
  },

  /**
   * Mapeia o setor do frontend para o enum de área esperado pelo backend
   */
  mapearAreaParaBackend(setor) {
    const areaMap = {
      'Informatica': 'ADS_REDES',
      'Mecanica': 'MECANICA',
      'Faculdade': 'FACULDADE_SENAI',
      'Geral': 'GERAL'
    };
    return areaMap[setor] || 'GERAL';
  },

  /**
   * Formata a data para exibição
   */
  formatarData(dataHora) {
    if (!dataHora) return 'Data não informada';
    
    try {
      const data = new Date(dataHora);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dataHora;
    }
  },

  /**
   * Atualiza uma manifestação (apenas para admins)
   */
  async atualizarManifestacao(id, dadosAtualizados) {
    try {
      const response = await fetch(buildUrl(`/manifestacoes/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(dadosAtualizados)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar manifestação ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta uma manifestação (apenas para admins)
   */
  async deletarManifestacao(id) {
    try {
      const response = await fetch(buildUrl(`/manifestacoes/${id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return true; // Sucesso
    } catch (error) {
      console.error(`Erro ao deletar manifestação ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria uma nova reclamação
   */
  async criarReclamacao(reclamacao) {
    try {
      const response = await fetch(buildUrl("/reclamacoes"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(reclamacao)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar reclamação:", error);
      throw error;
    }
  },

  /**
   * Cria uma nova denúncia
   */
  async criarDenuncia(denuncia) {
    try {
      const response = await fetch(buildUrl("/denuncias"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(denuncia)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar denúncia:", error);
      throw error;
    }
  },

  /**
   * Cria um novo elogio
   */
  async criarElogio(elogio) {
    try {
      const response = await fetch(buildUrl("/elogios"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(elogio)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar elogio:", error);
      throw error;
    }
  },

  /**
   * Cria uma nova sugestão
   */
  async criarSugestao(sugestao) {
    try {
      const response = await fetch(buildUrl("/sugestoes"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(sugestao)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar sugestão:", error);
      throw error;
    }
  },

  /**
   * Formata data e hora para o formato ISO esperado pelo backend
   */
  formatarDataHora(dataHora) {
    if (!dataHora) return new Date().toISOString();
    
    try {
      // Se já estiver no formato datetime-local (YYYY-MM-DDTHH:mm)
      // converte para ISO string
      const data = new Date(dataHora);
      return data.toISOString();
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return new Date().toISOString();
    }
  },

  /**
   * Mapeia o setor selecionado para o enum do backend
   * TipoReclamacao aceita apenas: MANUTENCAO ou ADMINISTRACAO
   */
  mapearSetor(setor) {
    const setorMap = {
      'Geral': 'ADMINISTRACAO',
      'Informatica': 'MANUTENCAO',
      'Mecanica': 'MANUTENCAO',
      'Faculdade': 'ADMINISTRACAO'
    };
    return setorMap[setor] || 'ADMINISTRACAO';
  }
};