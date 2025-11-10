import { api } from './api';


const buildUrl = (path) => {
  
    const API_BASE = typeof process.env.REACT_APP_API_BASE !== 'undefined' 
        ? process.env.REACT_APP_API_BASE 
        : "http://mock-api-base.com";

    if (!API_BASE) return path;
    if (path.startsWith("http")) return path;
    
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const p = path.startsWith("/") ? path : `/${path}`;
    
    return `${base}${p}`;
};

export const manifestacoesService = {
   
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
                
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar manifestações:", error);
            throw error;
        }
    },

    
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar manifestações do tipo ${tipo}:`, error);
            throw error;
        }
    },

    
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar manifestação ${id}:`, error);
            throw error;
        }
    },

   
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            throw error;
        }
    },

   
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

  
    formatarTipo(tipo) {
        const tipoMap = {
            'RECLAMACAO': 'Reclamação',
            'DENUNCIA': 'Denúncia',
            'ELOGIO': 'Elogio',
            'SUGESTAO': 'Sugestão'
        };
        return tipoMap[tipo] || tipo;
    },

    
    mapearAreaParaBackend(setor) {
        const areaMap = {
            'Informatica': 'ADS_REDES',
            'Mecanica': 'MECANICA',
            'Faculdade': 'FACULDADE_SENAI',
            'Geral': 'GERAL'
        };
        return areaMap[setor] || 'GERAL';
    },

   
    formatarData(dataHora) {
        if (!dataHora) return 'Data não informada';
        
        try {
            const data = new Date(dataHora);
            
            if (isNaN(data.getTime())) {
                 return dataHora;
            }
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false 
            });
        } catch (error) {
           
            return dataHora;
        }
    },

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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao atualizar manifestação ${id}:`, error);
            throw error;
        }
    },

   
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return true; 
        } catch (error) {
            console.error(`Erro ao deletar manifestação ${id}:`, error);
            throw error;
        }
    },

    
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar reclamação:", error);
            throw error;
        }
    },

    
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar denúncia:", error);
            throw error;
        }
    },

    
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar elogio:", error);
            throw error;
        }
    },

  
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
                const errorBody = await response.text();
                throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar sugestão:", error);
            throw error;
        }
    },

    
    formatarDataHora(dataHora) {
        if (!dataHora) return new Date().toISOString();
        
        try {
            const data = new Date(dataHora);
            return data.toISOString();
        } catch (error) {
            console.error("Erro ao formatar data:", error);
            return new Date().toISOString();
        }
    },

    
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