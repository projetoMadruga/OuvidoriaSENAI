import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import CrudService from "../../services/CrudService";
import { manifestacoesService } from "../../services/manifestacoesService";
import "./Funcionario.css"; 

import SenaiLogo from '../../assets/imagens/logosenai.png';


const FuncionarioHeader = React.memo(({ navigate, usuarioEmail }) => {
    
    const headerTitle = 'Painel do Funcionário';
    const emailDisplay = usuarioEmail || '@senai.br';
    
    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/');
    };

    return (
        <div className="funcionario-header-full">
            <div className="funcionario-header-left">
                <img
                    src={SenaiLogo}
                    alt="Logo SENAI"
                    className="senai-logo-img"
                />
                <div>
                    <h1>{headerTitle}</h1>
                    <span>Bem-Vindo(a), {emailDisplay}</span> 
                </div>
            </div>
            <div className="funcionario-header-right">
                <button
                    className="btn-sair"
                    onClick={handleLogout}
                >
                    Sair
                </button>
            </div>
        </div>
    );
});



const DetalhesModal = React.memo(({ item, fecharVisualizacao, traduzirTipo, getFuncionarioStatus }) => {
    
    if (!item) return null;

    const dataHoraFormatada = new Date(item.dataCriacao).toLocaleDateString("pt-BR", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    
    const localIncidente = item.localIncidente || item.local || 'Não especificado'; 
    const statusTraduzido = getFuncionarioStatus(item.status);

    return (
        <div className="modal-overlay" onClick={fecharVisualizacao}>
            <div 
                className="modal-content" 
                onClick={(e) => e.stopPropagation()} 
            >
                <h3>Detalhes da Manifestação</h3>
                
                <p><strong>Local do Incidente: </strong>{localIncidente}</p>
                
                <p><strong>Data e Hora: </strong>{dataHoraFormatada}</p>

                <p><strong>Tipo: </strong>{traduzirTipo(item.tipo)}</p>

                <p><strong>Status: </strong>{statusTraduzido}</p>

                <div className="modal-section">
                    <strong>Descrição:</strong>
                    <p>{item.descricao || 'Descrição não fornecida.'}</p>
                </div>

                {item.respostaAdmin && (
                    <div className="modal-section resposta-admin">
                        <strong>Resposta da Coordenação:</strong>
                        <p>{item.respostaAdmin}</p>
                    </div>
                )}

                <button 
                    className="btn-fechar-modal" 
                    onClick={fecharVisualizacao}
                >
                    Fechar
                </button>
            </div>
        </div>
    );
});



function Funcionario() {
    const navigate = useNavigate();
    const [manifestacoes, setManifestacoes] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [itemVisualizando, setItemVisualizando] = useState(null);
    
    const fecharVisualizacao = useCallback(() => setItemVisualizando(null), []);

    const { traduzirTipo, FUNCIONARIO_STATUS_MAP } = useMemo(() => {
        
        const STATUS = CrudService.STATUS_MANIFESTACAO || {};
        const TIPOS = CrudService.TIPOS_MANIFESTACAO || {};

        const tipos = {
            [TIPOS.RECLAMACAO]: "Reclamação",
            [TIPOS.DENUNCIA]: "Denúncia",
            [TIPOS.ELOGIO]: "Elogio",
            [TIPOS.SUGESTAO]: "Sugestão",
        };

        const statusMap = {
            [STATUS.PENDENTE]: 'Pendente',
            [STATUS.EM_ANALISE]: 'Em Análise',
            [STATUS.RESOLVIDO]: 'Resolvido',
            [STATUS.ARQUIVADO]: 'Arquivado',
        };

        return {
            traduzirTipo: (tipo) => tipos[tipo] || tipo,
            FUNCIONARIO_STATUS_MAP: statusMap,
        };
    }, []);

    const getFuncionarioStatus = useCallback((statusOriginal) => {
        return FUNCIONARIO_STATUS_MAP[statusOriginal] || 'Pendente';
    }, [FUNCIONARIO_STATUS_MAP]);
    
    const formatarData = (dataIso) => {
        if (!dataIso) return "";
        const data = new Date(dataIso);
        return data.toLocaleDateString("pt-BR");
    };

    const carregarManifestacoes = useCallback(async (usuario) => {
        if (!usuario || !usuario.email) {
            setManifestacoes([]);
            return;
        }

        try {
          
            const manifestacoesBackend = await manifestacoesService.listarManifestacoes();
            
           
            const manifestacoesFormatadas = manifestacoesBackend.map(m => {
                const setorOverrides = localStorage.getItem('setorOverridesById');
                const setorMap = setorOverrides ? JSON.parse(setorOverrides) : {};
                const setorOverride = setorMap[m.id.toString()];

                return {
                    id: m.id.toString(),
                    tipo: manifestacoesService.formatarTipo(m.tipo),
                    dataCriacao: m.dataHora,
                    status: manifestacoesService.formatarStatus(m.status),
                    descricao: m.descricaoDetalhada,
                    respostaAdmin: m.observacao || '',
                    localIncidente: m.local,
                    usuarioEmail: m.emailUsuario,
                    contacto: m.emailUsuario,
                    setorOverride: setorOverride 
                };
            });

           
            const manifestacoesOrdenadas = manifestacoesFormatadas.sort((a, b) => 
                new Date(b.dataCriacao) - new Date(a.dataCriacao)
            );

            setManifestacoes(manifestacoesOrdenadas);

        } catch (error) {
            console.error("Erro ao carregar manifestações do backend. Tentando fallback para localStorage:", error);
         
            const dados = CrudService.getByEmail(usuario.email) || [];
            
            

            const manifestacoesOrdenadas = dados.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
            setManifestacoes(manifestacoesOrdenadas);
        }
    }, [getFuncionarioStatus]); 

   
    useEffect(() => {
        const storedUser = localStorage.getItem("usuarioLogado");
        let usuario = null;

        if (storedUser) {
            try {
                usuario = JSON.parse(storedUser);
            } catch (e) {
                console.error("Erro ao parsear usuário logado:", e);
            }
        }
        
        if (!usuario || !usuario.email) {
            alert("Você precisa estar logado para acessar esta página.");
            navigate("/", { replace: true });
            return;
        }

        const isFuncionario = usuario.email.toLowerCase().endsWith("@senai.br") &&
                             !usuario.email.toLowerCase().endsWith("@aluno.senai.br");

        if (!isFuncionario) {
            alert("Acesso restrito. Esta página é exclusiva para Funcionários.");
            navigate("/", { replace: true });
            return;
        }

        setUsuarioLogado(usuario);
        carregarManifestacoes(usuario); 
    }, [navigate, carregarManifestacoes]);

    
    const { total, pendente, emAnalise, resolvido } = useMemo(() => {
        const counts = { total: 0, 'Pendente': 0, 'Em Análise': 0, 'Resolvido': 0 };

        manifestacoes.forEach(m => {
            counts.total++;
            const statusReal = getFuncionarioStatus(m.status); 
            counts[statusReal]++;
        });
        
        return {
            total: counts.total,
            pendente: counts['Pendente'],
            emAnalise: counts['Em Análise'],
            resolvido: counts['Resolvido'],
        };

    }, [manifestacoes, getFuncionarioStatus]);

    
    const renderManifestacaoCard = (item) => {
        const funcionarioStatus = getFuncionarioStatus(item.status);
        const statusClass = funcionarioStatus.replace(/\s/g, '-').toLowerCase();
        const setorInfo = item.setorOverride ? ` | Setor: ${item.setorOverride}` : '';


        return (
            <div key={item.id} className="manifestacao-card-item">
                <div className="manifestacao-card-info">
                    <div className="tipo-e-data">
                        <span className="manifestacao-tipo">{traduzirTipo(item.tipo)}{setorInfo}</span>
                        <span className="manifestacao-data">{formatarData(item.dataCriacao)}</span>
                    </div>
                    <span className={`manifestacao-status ${statusClass}`}>{funcionarioStatus}</span>
                </div>

                <p className="manifestacao-problema">{item.descricao || 'Descrição não fornecida.'}</p>

                {item.respostaAdmin && (
                    <div className="manifestacao-resposta">
                        <strong>Resposta:</strong>
                        <p>{item.respostaAdmin}</p>
                    </div>
                )}

                <button
                    className="btn-ver-detalhes"
                    onClick={() => setItemVisualizando(item)}
                >
                    Ver detalhes
                </button>
            </div>
        );
    };


    if (!usuarioLogado) {
        return <div className='funcionario-container'>Carregando painel...</div>;
    }

    return (
        <div className="funcionario-container">
            <FuncionarioHeader navigate={navigate} usuarioEmail={usuarioLogado.email} />
            <div className='linha-vermelha' /> 

            <div className="funcionario-main-content-wrapper">
                
                <div className='funcionario-summary-cards'>
                    {[
                        { label: 'Total de Manifestações', value: total, className: 'card-total' },
                        { label: 'Em Análise', value: emAnalise, className: 'card-analise' },
                        { label: 'Resolvidas', value: resolvido, className: 'card-resolvidas' },
                    ].map((item, index) => (
                        <div 
                            key={index} 
                            className={`funcionario-card ${item.className}`}
                        >
                            <p>{item.label}</p>
                            <h3>{item.value}</h3>
                        </div>
                    ))}
                </div>

                <div className='minhas-manifestacoes-section-wrapper'>
                    <div className='minhas-manifestacoes-card'>
                        
                        <h3>Minhas Manifestações Registradas</h3> 
                        <small>Visualize e acompanhe o status das manifestações que você registrou.</small>

                        <div className='manifestacoes-list'>
                            {manifestacoes.length === 0 ? (
                                <p className="sem-registros">
                                    Você não tem manifestações registradas neste momento.
                                </p>
                            ) : (
                                manifestacoes.map(renderManifestacaoCard)
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
            
            <DetalhesModal
                item={itemVisualizando}
                fecharVisualizacao={fecharVisualizacao}
                traduzirTipo={traduzirTipo}
                getFuncionarioStatus={getFuncionarioStatus}
            />
        </div>
    );
}

export default Funcionario;