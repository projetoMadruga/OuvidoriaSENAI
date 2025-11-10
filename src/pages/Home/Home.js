import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import Dropdown from '../../Components/Dropdown';
import BotaoOuvidoria from '../../Components/BotaoOuvidoria';
import Footer from '../../Components/Footer';
import bannerImage from '../../assets/imagens/bannersenai.png';
import './Home.css';
import ModalHorario from '../../Components/ModalHorario';
import ModalLogin from '../../Components/ModalLogin';
import ModalCadastro from '../../Components/ModalCadastro';
import ModalSenha from '../../Components/ModalSenha';

function Home() {
  const navigate = useNavigate();

  const [modalHorarioVisivel, setModalHorarioVisivel] = useState(false);
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [modalCadastroVisivel, setModalCadastroVisivel] = useState(false);
  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [destinoPosLogin, setDestinoPosLogin] = useState('');


  const isLoggedIn = () => {
    return !!localStorage.getItem('usuarioLogado');
  };

  const handleOuvidoriaClick = (path) => {
    if (isLoggedIn()) {
      navigate(path);
    } else {
      setDestinoPosLogin(path);
      setModalLoginVisivel(true);
    }
  };

  const abrirCadastro = () => {
    setModalLoginVisivel(false);
    setModalCadastroVisivel(true);
  };

  const abrirLogin = () => {
    setModalCadastroVisivel(false);
    setModalSenhaVisivel(false);
    setModalLoginVisivel(true);
  };

  const abrirSenha = () => {
    setModalLoginVisivel(false);
    setModalSenhaVisivel(true);
  };

  const onLoginSuccess = (usuario) => {
    setModalLoginVisivel(false);
    setModalCadastroVisivel(false);
    setModalSenhaVisivel(false);

    if (destinoPosLogin) {
      navigate(destinoPosLogin);
    } else if (usuario && usuario.tipo) {

      switch (usuario.tipo) {
        case 'Administrador':
          navigate('/admin');
          break;
        case 'Aluno':
          navigate('/aluno');
          break;
        case 'Funcionário':
          navigate('/funcionario');
          break;
        default:
          navigate('/denuncia');
          break;
      }
    } else {
      navigate('/denuncia');
    }
  };


  return (
    <div className="home-container">
      <Header />

      <div className="banner-container">
        <img
          src={bannerImage}
          alt="Banner SENAI"
          className="banner"
        />
        <div className="texto-bemvindo">
          <h1>OUVIDORIA</h1>
          <h2>Bem-vindo à Ouvidoria do SENAI Suíço Brasileira</h2>
        </div>
      </div>

      
      <div className="conteudo-ouvidoria-principal">

        <div className="drop-area">
          <Dropdown titulo="O que é?">
            A Ouvidoria é um canal de comunicação entre a comunidade e a escola, onde é possível enviar denúncias, reclamações, sugestões e elogios. Ela busca garantir um atendimento transparente e imparcial.
          </Dropdown>
          <Dropdown titulo="Quem pode utilizar este serviço?">
            Alunos, pais, colaboradores e todos os membros da comunidade escolar podem acessar a Ouvidoria para expressar suas preocupações, sugestões e reconhecimentos.
          </Dropdown>
          <Dropdown titulo="Etapas para utilização deste serviço">
            1- Escolha o tipo de manifestação (denúncia, reclamação, elogio ou sugestão). 2- Preencha o formulário com as informações solicitadas. 3- Envie a manifestação e aguarde o retorno da Ouvidoria. 4- Acompanhe o status da sua manifestação, se disponível.
          </Dropdown>
          <Dropdown titulo="Perguntas Frequentes sobre a Ouvidoria">
            Veja o FAQ no rodapé.
          </Dropdown>
          <Dropdown titulo="Outras informações">
            Entre em contato conosco.
          </Dropdown>
        </div>


        <div className="descricao">
          A Ouvidoria da Escola SENAI Suiço-Brasileira é um canal de diálogo que busca garantir transparência e escuta ativa para denúncias, reclamações, sugestões e elogios. Seu objetivo é identificar oportunidades de melhoria e tratar todas as manifestações com imparcialidade, contribuindo para o aperfeiçoamento da escola e a satisfação dos usuários.
        </div>

      </div>
     


      <div className="botoes-ouvidoria">
        <BotaoOuvidoria
          imagem="denuncia.png"
          texto="DENÚNCIA"
          onClick={() => handleOuvidoriaClick('/denuncia')}
        />
        <BotaoOuvidoria
          imagem="reclamacao.png"
          texto="RECLAMAÇÃO"
          onClick={() => handleOuvidoriaClick('/reclamacao')}
        />
        <BotaoOuvidoria
          imagem="elogio.png"
          texto="ELOGIO"
          onClick={() => handleOuvidoriaClick('/elogio')}
        />
        <BotaoOuvidoria
          imagem="sugestao.png"
          texto="SUGESTÃO"
          onClick={() => handleOuvidoriaClick('/sugestao')}
        />
      </div>


      <button
        className="botao-horario"
        onClick={() => setModalHorarioVisivel(true)}
      >
        VEJA O HORÁRIO DE ATENDIMENTO
      </button>


      {modalHorarioVisivel && (
        <ModalHorario onClose={() => setModalHorarioVisivel(false)} />
      )}
      {modalLoginVisivel && (
        <ModalLogin
          isOpen={modalLoginVisivel}
          onClose={() => setModalLoginVisivel(false)}
          onCadastro={abrirCadastro}
          onEsqueciSenha={abrirSenha}
          onLoginSuccess={onLoginSuccess}
        />
      )}
      {modalCadastroVisivel && (
        <ModalCadastro
          isOpen={modalCadastroVisivel}
          onClose={() => setModalCadastroVisivel(false)}
          onLogin={abrirLogin}
        />
      )}
      {modalSenhaVisivel && (
        <ModalSenha
          isOpen={modalSenhaVisivel}
          onClose={() => setModalSenhaVisivel(false)}
          onLogin={abrirLogin}
        />
      )}

      <Footer />
    </div>
  );
}

export default Home;