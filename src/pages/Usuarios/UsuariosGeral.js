import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer'; 
import logoSenai from '../../assets/imagens/logosenai.png'; 
import { manifestacoesService } from '../../services/manifestacoesService';
import './UsuariosGeral.css';

const { createElement: e } = React;

const normalizeString = (str) => {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

const getTipoUsuarioFromEmail = (email) => {
    if (email.endsWith("@aluno.senai.br")) return "Aluno";
    if (email.endsWith("@senai.br")) return "Funcionário"; 
    return "Outro";
};

const ADMINS_A_EXCLUIR = ['diretor@senai.br'];

const CrudServiceSimulado = {
    getAllUsers: () => {
        try {
            const data = localStorage.getItem('usuarios');
            if (data) {
                return JSON.parse(data).map((user, index) => ({
                    id: user.id || index + 1,
                    tipo: getTipoUsuarioFromEmail(user.email), 
                    ...user
                }));
            }
            return [];
        } catch (e) {
            console.error("Erro ao carregar usuários do localStorage:", e);
            return [];
        }
    },
    persistUsers: (users) => {
        const usersToSave = users.map(({ id, tipo, ...rest }) => rest);
        localStorage.setItem('usuarios', JSON.stringify(usersToSave));
    }
};

const AdminHeader = ({ logo, usuarioNome, navigate, activePage }) => {
    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/');
    };
    
    const getNavClass = (page) => {
        let baseClass = '';
        if (page === 'manifestacoes') baseClass = 'btn-manifestacoes';
        if (page === 'usuarios') baseClass = 'btn-usuarios';
        if (page === 'sair') baseClass = 'btn-sair';

        return page === activePage ? `${baseClass} active` : baseClass;
    }

    return e('div', { className: 'admin-header-full' }, 
        e('div', { className: 'admin-header-left' },
            e('button', {
                className: 'btn-voltar',
                onClick: () => navigate('/'),
                style: { marginRight: '15px', cursor: 'pointer' }
            }, '← Voltar'),
            e('img', { src: logo, alt: 'SENAI Logo' }),
            e('div', null,
                e('h1', null, 'Painel Administrativo - Geral'),
                e('span', null, `Bem-vindo(a), ${usuarioNome || 'Admin'}`) 
            )
        ),
        e('div', { className: 'admin-header-right' },
            e('button', {
                className: getNavClass('manifestacoes'),
                onClick: () => navigate('/admin') 
            }, 'Manifestações'),
            
            e('button', {
                className: getNavClass('usuarios'),
                onClick: () => navigate('/admin/usuarios-geral') 
            }, 'Usuários'),
            
            e('button', {
                className: getNavClass('sair'),
                onClick: handleLogout
            }, 'Sair')
        )
    );
};

const ModalInspecionarUsuario = ({ onClose, usuario }) => {
    if (!usuario) return null;

    return e(
        'div',
        { className: 'modal-overlay', onClick: onClose }, 
        e(
            'div',
            { 
                className: 'modal-content modal-inspecionar', 
                onClick: (e) => e.stopPropagation() 
            },
            [
                e('div', { key: 'header', className: 'modal-header' }, [
                    e('h2', { key: 'title' }, `Inspeção de Usuário: ${usuario.nome}`),
                    e('button', { key: 'close', className: 'close-button', onClick: onClose }, '×')
                ]),

                e('div', { key: 'body', className: 'modal-body' }, [
                    e('p', { key: 'nome' }, [e('strong', null, 'Nome Completo: '), usuario.nome]),
                    e('p', { key: 'tipo' }, [e('strong', null, 'Tipo de Usuário: '), usuario.tipo || 'N/A']),
                    e('p', { key: 'email' }, [e('strong', null, 'Email: '), usuario.email]),
                    e('p', { key: 'area' }, [e('strong', null, 'Curso/Área: '), usuario.curso || 'N/A']),
                    e('p', { key: 'telefone' }, [e('strong', null, 'Telefone: '), usuario.telefone || 'N/A']),
                    e('p', { key: 'cpf' }, [e('strong', null, 'CPF: '), usuario.cpf || 'N/A']),
                ]),
                
                e('div', { key: 'footer', className: 'modal-actions' }, [
                    e('button', { 
                        key: 'btn-fechar', 
                        className: 'btn-primary', 
                        onClick: onClose 
                    }, 'Fechar')
                ])
            ]
        )
    );
}

function UsuariosGeral() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [modalUsuario, setModalUsuario] = useState(null); 

    const ADMIN_EMAIL = 'diretor@senai.br'; 

    useEffect(() => {
        let usuario = null;
        try {
            const stored = localStorage.getItem('usuarioLogado');
            if (stored) {
                usuario = JSON.parse(stored);
                setUsuarioLogado(usuario);
            }
        } catch (e) {
            console.error('Erro ao parse do localStorage (usuarioLogado):', e);
        }

        if (!usuario || usuario.email !== ADMIN_EMAIL) {
            alert('Você precisa estar logado como administrador geral para acessar esta página.');
            navigate('/');
            return;
        }

        // Carrega usuários do backend
        carregarUsuariosDoBackend();
        
    }, [navigate]);

    const carregarUsuariosDoBackend = async () => {
        try {
            // Busca todos os usuários do backend
            const usuariosBackend = await manifestacoesService.listarUsuarios();
            
            console.log('Usuários do backend:', usuariosBackend); // Debug
            
            // Função para formatar o tipo de usuário
            const formatarTipo = (cargoUsuario, email) => {
                if (cargoUsuario === 'ALUNO') return 'Aluno';
                if (cargoUsuario === 'FUNCIONARIO') return 'Funcionário';
                if (cargoUsuario === 'ADMIN') return 'Administrador';
                if (cargoUsuario === 'MANUTENCAO') return 'Manutenção';
                // Fallback: detecta pelo email
                return getTipoUsuarioFromEmail(email);
            };
            
            // Converte para o formato esperado pelo frontend
            const usuariosFormatados = usuariosBackend.map(u => ({
                id: u.id.toString(),
                nome: u.nome || 'Nome não informado',
                email: u.emailEducacional,
                tipo: formatarTipo(u.cargoUsuario, u.emailEducacional),
                curso: u.curso || 'Não informado',
                telefone: u.telefone || 'Não informado',
                cpf: u.cpf || 'Não informado',
                dataCadastro: new Date().toISOString(),
                ativo: true
            }));

            // Filtra usuários (exclui admins)
            const usuariosFiltrados = usuariosFormatados.filter(u => {
                const isNotAdmin = u.email !== ADMIN_EMAIL;
                const isNotAdminToExclude = !ADMINS_A_EXCLUIR.includes(u.email);
                return isNotAdmin && isNotAdminToExclude;
            });
            
            console.log('Usuários filtrados:', usuariosFiltrados); // Debug
            setUsuarios(usuariosFiltrados);
        } catch (error) {
            console.error("Erro ao carregar usuários do backend:", error);
            alert('Erro ao carregar usuários. Verifique sua conexão e tente novamente.');
            setUsuarios([]);
        }
    };

    const filtrarPorTipo = (lista, tipo) => {
        if (tipo === 'Todos') return lista;
        return lista.filter(u => normalizeString(u.tipo) === normalizeString(tipo)); 
    };

    const usuariosFiltrados = filtrarPorTipo(usuarios, filtroTipo);

    const getTipoLabel = (tipo) => {
        switch(tipo) {
            case 'Aluno': return 'Alunos';
            case 'Funcionário': return 'Funcionários';
            case 'Outro': return 'Outros'; 
            default: return 'Todos';
        }
    };
    
    const inspecionarUsuario = (usuario) => {
        setModalUsuario(usuario); 
    };
    
    const fecharModal = () => {
        setModalUsuario(null);
    };

    const excluirUsuario = (usuario) => {
        if (window.confirm(`Tem certeza que deseja excluir ${usuario.nome}? Essa ação é irreversível!`)) {
            
            const novosUsuariosGeral = usuarios.filter(u => u.id !== usuario.id);
            setUsuarios(novosUsuariosGeral);
            
            const todosUsuarios = CrudServiceSimulado.getAllUsers();
            const listaFinal = todosUsuarios.filter(u => u.id !== usuario.id);
            CrudServiceSimulado.persistUsers(listaFinal);

            console.log(`Usuário ${usuario.nome} excluído!`);
        }
    };

    const tabelaCorpo = usuariosFiltrados.length === 0
        ? [e('tr', { key: 'empty' },
              e('td', { colSpan: 5, className: 'empty-row-message' }, 'Nenhum usuário encontrado para este filtro.')
          )]
        : usuariosFiltrados.map(u => e('tr', { key: u.id },
              e('td', null, u.tipo || 'N/A'), 
              e('td', null, u.nome),
              e('td', null, u.curso || 'N/A'), 
              e('td', null, u.email),
              e('td', { className: 'table-actions' },
                  e('button', { className: 'btn-gerenciar', onClick: () => inspecionarUsuario(u) }, 'Inspecionar'), 
                  e('button', { className: 'btn-excluir', onClick: () => excluirUsuario(u) }, 'Excluir')
              )
          ));
    
    const botoesFiltro = ['Todos', 'Aluno', 'Funcionário'].map(tipo => 
        e('button', {
            key: tipo,
            className: filtroTipo === tipo ? 'btn-filter active-filter' : 'btn-filter',
            onClick: () => setFiltroTipo(tipo)
        }, getTipoLabel(tipo))
    );

    return e('div', { className: 'admin-container' },
        e(AdminHeader, { 
            logo: logoSenai, 
            usuarioNome: usuarioLogado?.nome || 'Diretor', 
            navigate: navigate, 
            activePage: "usuarios" 
        }),
        
        e('div', { className: 'linha-vermelha' }),

        e('div', { className: 'admin-main-content-wrapper' },
            e('div', { className: 'usuarios-table-card' },
                
                e('div', { className: 'usuarios-header-content-inner' },
                    e('h3', null, 'Usuários Registrados (Geral)'),
                    e('p', null, 'Gerencie todos os usuários do sistema')
                ),
                
                e('div', { className: 'usuarios-filter-buttons' }, 
                    e('span', { className: 'filter-label' }, 'Filtrar por tipo:'),
                    ...botoesFiltro
                ),

                e('div', { className: 'table-wrapper' },
                    e('table', { className: 'table-users' },
                        e('thead', null,
                            e('tr', null,
                                e('th', null, 'Tipo'),
                                e('th', null, 'Nome'),
                                e('th', null, 'Área'),
                                e('th', null, 'Email'),
                                e('th', null, 'Ações')
                            )
                        ),
                        e('tbody', null, ...tabelaCorpo)
                    )
                )
            )
        ),

        modalUsuario && e(ModalInspecionarUsuario, { 
            onClose: fecharModal, 
            usuario: modalUsuario 
        }),

        e('div', { className: 'footer-wrapper' }, 
            e(Footer, null)
        )
    );
}

export default UsuariosGeral;
