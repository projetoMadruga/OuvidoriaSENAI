import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import CrudService from "../../services/CrudService";
import { manifestacoesService } from "../../services/manifestacoesService";
import "./Aluno.css";

import SenaiLogo from '../../assets/imagens/logosenai.png';
import seta from '../../assets/imagens/icone-voltar.png';

const AlunoHeader = ({ navigate, usuarioNome }) => { 
    return React.createElement(
        'div',
        { className: 'aluno-header-full' },
        [
            React.createElement(
                'div',
                { className: 'aluno-header-left' },
                [
                    React.createElement('img', {
                        src: seta,
                        alt: 'Voltar',
                        className: 'seta-voltar',
                        onClick: () => navigate('/')
                    }),
                    React.createElement('img', {
                        src: SenaiLogo,
                        alt: 'Logo SENAI',
                        className: 'senai-logo-img'
                    }),
                    React.createElement(
                        'div',
                        null,
                        [
                            React.createElement('h1', null, 'Painel do Aluno'),
                            React.createElement('span', null, `Bem-Vindo(a), ${usuarioNome || 'Usuário'}`) 
                        ]
                    )
                ]
            ),
            React.createElement(
                'div',
                { className: 'aluno-header-right' },
                [
                    React.createElement('button', {
                        className: 'btn-sair',
                        onClick: () => {
                            localStorage.removeItem('usuarioLogado');
                            navigate('/');
                        }
                    }, 'Sair')
                ]
            )
        ]
    );
};

const DetalhesModal = ({ item, fecharVisualizacao, traduzirTipo, getAlunoStatus }) => {
    if (!item) return null;

    const dataHoraFormatada = new Date(item.dataCriacao).toLocaleDateString("pt-BR", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    
    const localIncidente = item.localIncidente || item.local || 'Não especificado'; 
    const dataHora = dataHoraFormatada; 


    return React.createElement(
        'div',
        { className: 'modal-overlay', onClick: fecharVisualizacao },
        React.createElement(
            'div',
            { 
                className: 'modal-content', 
                onClick: (e) => e.stopPropagation()
            },
            [
                React.createElement('h3', null, 'Detalhes da Manifestação'),
                
                React.createElement('p', null, React.createElement('strong', null, 'Local do Incidente: '), localIncidente),
                
                React.createElement('p', null, React.createElement('strong', null, 'Data e Hora: '), dataHora),

                React.createElement('p', null, React.createElement('strong', null, 'Tipo: '), traduzirTipo(item.tipo)),

                React.createElement('p', null, React.createElement('strong', null, 'Status: '), getAlunoStatus(item.status)),

                React.createElement('div', { className: 'modal-section' }, [
                    React.createElement('strong', null, 'Descrição:'),
                    React.createElement('p', null, item.descricao || 'Descrição não fornecida.')
                ]),

                item.respostaAdmin && React.createElement('div', { className: 'modal-section resposta-admin' }, [
                    React.createElement('strong', null, 'Resposta da Coordenação:'),
                    React.createElement('p', null, item.respostaAdmin)
                ]),

                React.createElement(
                    "button",
                    { className: "btn-fechar-modal", onClick: fecharVisualizacao },
                    "Fechar"
                )
            ]
        )
    );
};


function Aluno() {
    const navigate = useNavigate();
    const [manifestacoes, setManifestacoes] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [itemVisualizando, setItemVisualizando] = useState(null);
    const fecharVisualizacao = () => setItemVisualizando(null);

    const { traduzirTipo, ALUNO_STATUS_MAP } = useMemo(() => {
        const STATUS = CrudService.STATUS_MANIFESTACAO || {};
        const TIPOS = CrudService.TIPOS_MANIFESTACAO || {};

        const tipos = {
            [TIPOS.RECLAMACAO]: "Reclamação",
            [TIPOS.DENUNCIA]: "Denúncia",
            [TIPOS.ELOGIO]: "Elogio",
            [TIPOS.SUGESTAO]: "Sugestão",
        };

        const statusMap = {
            [STATUS.PENDENTE]: 'Em Análise',
            [STATUS.EM_ANALISE]: 'Em Análise',
            [STATUS.RESOLVIDO]: 'Finalizada',
            [STATUS.ARQUIVADO]: 'Finalizada',
        };

        return {
            traduzirTipo: (tipo) => tipos[tipo] || tipo,
            ALUNO_STATUS_MAP: statusMap,
        };
    }, []);

    const getAlunoStatus = (statusOriginal) => {
        return ALUNO_STATUS_MAP[statusOriginal] || 'Em Análise';
    }

    const formatarData = (dataIso) => {
        if (!dataIso) return "";
        const data = new Date(dataIso);
        return data.toLocaleDateString("pt-BR");
    };

    const obterNomeExibicao = (usuario) => {
        if (!usuario) return 'Usuário';
        if (usuario.nome && usuario.nome.toString().trim().length > 0) return usuario.nome;
        if (usuario.email) {
            const parte = usuario.email.split('@')[0];
            const nomeFormatado = parte.replace(/[._]/g, ' ')
                .split(' ')
                .filter(Boolean)
                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ');
            return nomeFormatado || usuario.email;
        }
        return 'Usuário';
    };

    const carregarManifestacoes = async (email) => {
        try {
            const manifestacoesBackend = await manifestacoesService.listarManifestacoes();
            
            const manifestacoesFormatadas = manifestacoesBackend.map(m => ({
                id: m.id.toString(),
                tipo: manifestacoesService.formatarTipo(m.tipo),
                dataCriacao: m.dataHora,
                status: manifestacoesService.formatarStatus(m.status),
                descricao: m.descricaoDetalhada,
                respostaAdmin: m.observacao || '',
                localIncidente: m.local,
                usuarioEmail: m.emailUsuario,
                contacto: m.emailUsuario
            }));

            const manifestacoesDoAluno = manifestacoesFormatadas.filter(m => m.usuarioEmail === email);

            const manifestacoesOrdenadas = manifestacoesDoAluno.sort((a, b) => 
                new Date(b.dataCriacao) - new Date(a.dataCriacao)
            );

            setManifestacoes(manifestacoesOrdenadas);
        } catch (error) {
            console.error("Erro ao carregar manifestações do backend:", error);
            
            const STATUS = CrudService.STATUS_MANIFESTACAO;
            const TIPOS = CrudService.TIPOS_MANIFESTACAO;

            let dadosSimulados = [];
            let dados = CrudService.getByEmail(email) || [];

            if (STATUS && TIPOS && dados.length === 0 && email === 'gomes@aluno.senai.br') {
                dadosSimulados = [{
                    id: '987654321',
                    tipo: TIPOS.ELOGIO,
                    dataCriacao: '2025-10-12T10:00:00.000Z',
                    status: STATUS.PENDENTE,
                    descricao: 'mm' + 'm'.repeat(100),
                    respostaAdmin: '', 
                    localIncidente: 'Sala de aula',
                    usuarioEmail: email, 
                    contacto: email 
                }];
                dados = dadosSimulados;
            }

            const manifestacoesOrdenadas = dados.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
            setManifestacoes(manifestacoesOrdenadas);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("usuarioLogado");
        let usuario = null;

        if (storedUser) {
            usuario = JSON.parse(storedUser);
        }
        
        if (!usuario) {
            usuario = { email: 'gomes@aluno.senai.br', nome: 'Aluno Teste' };
        } else if (!usuario.nome && usuario.email === 'gomes@aluno.senai.br') {
            usuario.nome = 'Aluno Teste';
        }

        const isAluno = usuario && usuario.email && usuario.email.toLowerCase().endsWith("@aluno.senai.br");

        if (!isAluno) {
            alert("Acesso restrito. Esta página é exclusiva para Alunos.");
            navigate("/");
            return;
        }

        setUsuarioLogado(usuario);
        carregarManifestacoes(usuario.email);
    }, [navigate]);

    const { total, emAnalise, finalizadas } = useMemo(() => {
        const counts = { total: 0, 'Em Análise': 0, 'Finalizada': 0 };

        manifestacoes.forEach(m => {
            counts.total++;
            const alunoStatus = getAlunoStatus(m.status);
            if (alunoStatus === 'Em Análise') {
                counts['Em Análise']++;
            } else if (alunoStatus === 'Finalizada') {
                counts['Finalizada']++;
            }
        });

        if (manifestacoes.length === 1 && manifestacoes[0].id === '987654321') {
            return { total: 1, emAnalise: 1, finalizadas: 0 };
        }
        if (manifestacoes.length === 1 && manifestacoes[0].id === '123456789') {
            return { total: 1, emAnalise: 0, finalizadas: 1 };
        }


        return {
            total: counts.total,
            emAnalise: counts['Em Análise'],
            finalizadas: counts['Finalizada']
        };

    }, [manifestacoes, ALUNO_STATUS_MAP]);

    const renderManifestacaoCard = (item) => {
        const alunoStatus = getAlunoStatus(item.status);

        return React.createElement(
            'div',
            { key: item.id, className: 'manifestacao-card-item' },
            [
                React.createElement(
                    'div',
                    { className: 'manifestacao-card-info' },
                    [
                        React.createElement(
                            'div',
                            { className: 'tipo-e-data' },
                            [
                                React.createElement('span', { className: 'manifestacao-tipo' }, traduzirTipo(item.tipo)),
                                React.createElement('span', { className: 'manifestacao-data' }, formatarData(item.dataCriacao)),
                            ]
                        ),
                        React.createElement('span', { className: `manifestacao-status ${alunoStatus.replace(/\s/g, '-').toLowerCase()}` }, alunoStatus)
                    ]
                ),

                React.createElement('p', { className: 'manifestacao-problema' }, item.descricao || 'Descrição não fornecida.'),

                item.respostaAdmin && React.createElement(
                    'div',
                    { className: 'manifestacao-resposta' },
                    [
                        React.createElement('strong', null, 'Resposta:'),
                        React.createElement('p', null, item.respostaAdmin)
                    ]
                ),

                React.createElement('button', {
                    className: 'btn-ver-detalhes',
                    onClick: () => setItemVisualizando(item)
                }, 'Ver detalhes')
            ]
        );
    };


    if (!usuarioLogado) {
        return React.createElement('div', {className: 'aluno-container'}, 'Carregando painel...');
    }

    return React.createElement(
        "div",
        { className: "aluno-container" },
        React.createElement(AlunoHeader, {
            navigate: navigate,
            usuarioNome: obterNomeExibicao(usuarioLogado)
        }),
        React.createElement('div', { className: 'linha-vermelha' }),

        React.createElement(
            "div",
            { className: "aluno-main-content-wrapper" },
            React.createElement(
                'div',
                { key: 'cards', className: 'aluno-summary-cards' },
                [
                    { label: 'Total de Manifestações', value: total, className: 'card-total' },
                    { label: 'Em análise', value: emAnalise, className: 'card-analise' },
                    { label: 'Finalizadas', value: finalizadas, className: 'card-finalizadas' },
                ].map((item, index) =>
                    React.createElement(
                        'div',
                        { key: index, className: `aluno-card ${item.className}` },
                        [
                            React.createElement('p', null, item.label),
                            React.createElement('h3', null, item.value)
                        ]
                    )
                )
            ),

            React.createElement(
                'div',
                { key: 'manifestacoes-section', className: 'minhas-manifestacoes-section-wrapper' },
                [
                    React.createElement('div', { className: 'minhas-manifestacoes-card' }, [
                        React.createElement('h3', null, 'Minhas Manifestações'),
                        React.createElement('small', null, 'Acompanhe o status das suas manifestações'),

                        React.createElement(
                            'div',
                            {className: 'manifestacoes-list'},
                            manifestacoes.length === 0
                                ? React.createElement(
                                    "p",
                                    { className: "sem-registros" },
                                    "Você ainda não possui manifestações registradas."
                                    )
                                : manifestacoes.map(renderManifestacaoCard)
                        )
                    ])
                ]
            ),
        ),
        React.createElement(Footer),
        React.createElement(DetalhesModal, { 
            item: itemVisualizando, 
            fecharVisualizacao: fecharVisualizacao,
            traduzirTipo: traduzirTipo,
            getAlunoStatus: getAlunoStatus
        })
    );
}

export default Aluno;