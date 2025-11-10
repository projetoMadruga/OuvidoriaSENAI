import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import Confirmacao from './pages/Confirmacao/Confirmacao';
import Denuncia from './pages/Denuncia/Denuncia';
import Elogio from './pages/Elogio/Elogio';
import Sugestao from './pages/Sugestao/Sugestao';
import Reclamacao from './pages/Reclamacao/Reclamacao';
import Aluno from './pages/Aluno/Aluno';
import Funcionario from './pages/Funcionario/Funcionario';
import Admin from './pages/Admin/Admin';
import AdmInfo from './pages/AdmInfo/AdmInfo';
import AdmMec from './pages/AdmMecan/AdmMec'; 
import AdmFac from './pages/AdmFac/AdmFac'; 
import UsuariosInfo from './pages/Usuarios/UsuariosInfo';
import UsuariosMec from './pages/Usuarios/UsuariosMec';
import UsuariosGeral from './pages/Usuarios/UsuariosGeral';
import UsuariosFac from './pages/Usuarios/UsuariosFac.js';
import ResetSenha from './pages/ResetSenha/ResetSenha';

import ModalLogin from './Components/ModalLogin';
import ModalCadastro from './Components/ModalCadastro';
import ModalSenha from './Components/ModalSenha';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isSenhaOpen, setIsSenhaOpen] = useState(false);

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const openCadastroModal = () => setIsCadastroOpen(true);
  const closeCadastroModal = () => setIsCadastroOpen(false);

  const openSenhaModal = () => setIsSenhaOpen(true);
  const closeSenhaModal = () => setIsSenhaOpen(false);

  return (
    <BrowserRouter>
      <Routes>
        
        
        <Route path="/" element={<Home openLoginModal={openLoginModal} />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/denuncia" element={<Denuncia />} />
        <Route path="/elogio" element={<Elogio />} />
        <Route path="/sugestao" element={<Sugestao />} />
        <Route path="/reclamacao" element={<Reclamacao />} />
        <Route path="/aluno" element={<Aluno />} />
        <Route path="/funcionario" element={<Funcionario />} />
        <Route path="/redefinir-senha" element={<ResetSenha />} />

     
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/usuarios-geral" element={<UsuariosGeral />} />

      
        <Route path="/admin/usuarios-info" element={<UsuariosInfo />} />
        <Route path="/admin/adm-info" element={<AdmInfo />} />

       
        <Route path="/admin/usuarios-mec" element={<UsuariosMec />} />
        <Route path="/admin/adm-mec" element={<AdmMec />} />

        <Route path="/admin/adm-fac" element={<AdmFac />} />
        <Route path="/admin/usuarios-fac" element={<UsuariosFac />} />
      </Routes>

    
      <ModalLogin
        isOpen={isLoginOpen}
        onClose={closeLoginModal}
        onCadastro={openCadastroModal}
        onEsqueciSenha={openSenhaModal}
      />
      
      <ModalCadastro
        isOpen={isCadastroOpen}
        onClose={closeCadastroModal}
      />
      
      <ModalSenha
        isOpen={isSenhaOpen}
        onClose={closeSenhaModal}
      />
    </BrowserRouter>
  );
}

export default App;