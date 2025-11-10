import React, { useState, useEffect } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import logoSenai from '../assets/imagens/logosenai.png';
import iconeUsuario from '../assets/imagens/boneco.png';
import ModalLogin from './ModalLogin';
import ModalCadastro from './ModalCadastro';
import ModalSenha from './ModalSenha';

const getNomeUsuarioLogado = () => {
    try {
        const usuarioLogadoString = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoString) {
            const usuarioLogado = JSON.parse(usuarioLogadoString);
            if (usuarioLogado.nome && usuarioLogado.nome.toString().trim().length > 0) {
                return usuarioLogado.nome;
            }
            if (usuarioLogado.email) {
                const parte = usuarioLogado.email.split('@')[0];
                const nomeFormatado = parte.replace(/[._]/g, ' ')
                    .split(' ')
                    .filter(Boolean)
                    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ');
                return nomeFormatado || usuarioLogado.email;
            }
        }
    } catch (error) {
        console.error("Erro ao ler ou fazer parse do usuário logado:", error);
    }
    return null;
};

function Header() {
    const navigate = useNavigate();
    const [modalAberto, setModalAberto] = useState('');
    const [nomeExibicao, setNomeExibicao] = useState(getNomeUsuarioLogado());

    useEffect(() => {
        const checkLoginStatus = () => {
            setNomeExibicao(getNomeUsuarioLogado());
        };
        window.addEventListener('storage', checkLoginStatus);
        return () => window.removeEventListener('storage', checkLoginStatus);
    }, []);

    const handleCloseModal = (isSuccessfulLogin = false) => {
        setModalAberto('');
        if (isSuccessfulLogin) {
            setNomeExibicao(getNomeUsuarioLogado());
        }
        setNomeExibicao(getNomeUsuarioLogado());
    };

    const menuItems = [
        { texto: 'O SENAI', ativo: true, link: 'https://www.sp.senai.br/' },
        { texto: 'Transparência', link: 'https://transparencia.sp.senai.br/' },
        { texto: 'Contato com a Ouvidoria', link: 'https://wa.me/551156423407' },
    ];

    function handleAlunoClick() {
        const isUserLoggedIn = !!nomeExibicao;
        if (isUserLoggedIn) {
            const usuarioLogadoString = localStorage.getItem('usuarioLogado');
            if (!usuarioLogadoString) return navigate('/');
            try {
                const usuarioLogado = JSON.parse(usuarioLogadoString);
                const email = usuarioLogado.email;
                if (!email) return navigate('/');
                if (email === "pino@docente.senai.br" || email === "pino@senai.br") return navigate("/admin/adm-mec");
                if (email === "chile@docente.senai.br" || email === "chile@senai.br") return navigate("/admin/adm-info");
                if (email === "diretor@senai.br") return navigate("/admin");
                if (email === "vieira@docente.senai.br" || email === "vieira@senai.br") return navigate("/admin/adm-fac");
                if (email.endsWith("@aluno.senai.br")) return navigate("/aluno");
                if (email.endsWith("@senai.br") || email.endsWith("@docente.senai.br")) return navigate("/funcionario");
                navigate('/');
            } catch (error) {
                setModalAberto('login');
            }
        } else {
            setModalAberto('login');
        }
    }

    return React.createElement(
        React.Fragment,
        null,
        React.createElement(
            'header',
            { className: 'header' },
            React.createElement('img', {
                src: logoSenai,
                alt: 'Logo SENAI',
                className: 'logo-senai'
            }),
            React.createElement(
                'nav',
                { className: 'nav-menu' },
                menuItems.map(({ texto, ativo, link }, index) =>
                    React.createElement(
                        'a',
                        {
                            key: index,
                            href: link || '#',
                            className: `nav-item ${ativo ? 'ativo' : ''}`,
                            target: link ? '_blank' : undefined,
                            rel: link ? 'noopener noreferrer' : undefined
                        },
                        texto
                    )
                )
            ),
            React.createElement(
                'button',
                {
                    className: 'usuario',
                    type: 'button',
                    onClick: handleAlunoClick
                },
                React.createElement('div', { className: 'divisor' }),
                React.createElement('img', {
                    src: iconeUsuario,
                    alt: 'Usuário',
                    className: 'icone-usuario'
                }),
                React.createElement(
                    'span',
                    { className: 'sou-aluno' },
                    nomeExibicao ? nomeExibicao.split(' ')[0] : 'Entrar'
                )
            )
        ),
        React.createElement(ModalLogin, {
            key: 'modal-login',
            isOpen: modalAberto === 'login',
            onClose: () => handleCloseModal(true),
            onCadastro: () => setModalAberto('cadastro'),
            onEsqueciSenha: () => setModalAberto('senha')
        }),
        React.createElement(ModalCadastro, {
            key: 'modal-cadastro',
            isOpen: modalAberto === 'cadastro',
            onClose: () => setModalAberto('login')
        }),
        React.createElement(ModalSenha, {
            key: 'modal-senha',
            isOpen: modalAberto === 'senha',
            onClose: () => setModalAberto('login')
        })
    );
}

export default Header;
