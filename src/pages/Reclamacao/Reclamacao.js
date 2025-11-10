import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { manifestacoesService } from '../../services/manifestacoesService';
import '../Reclamacao/Reclamacao.css';
import Footer from '../../Components/Footer';
import HeaderSimples from '../../Components/HeaderSimples';
import SetaVoltar from '../../Components/SetaVoltar';


import IconeAnexo from '../../assets/imagens/icone-anexo.png'; 

function Reclamacao() {
  const navigate = useNavigate();

 
  const usuarioLogado = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('usuarioLogado');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Erro ao ler usuário logado do localStorage:", e);
      return null;
    }
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    setor: 'Geral',
    local: '',
    dataHora: '',
    descricao: '',
    anexo: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (usuarioLogado) {
      setFormData(prevState => ({
        ...prevState,
        nome: usuarioLogado.nome || '',
        contato: usuarioLogado.email || '',
      }));
    }
  }, [usuarioLogado]); 

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; 

    if (file && file.size > MAX_SIZE) {
      alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
      
      e.target.value = null; 
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      anexo: file
    }));

    
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [previewUrl]);
  

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validarCamposComuns = useCallback(() => {
    if (!formData.descricao) {
      alert('Por favor, preencha a descrição detalhada da reclamação.');
      return false;
    }
    if (!formData.local) {
      alert('Por favor, preencha o local do incidente.');
      return false;
    }
    if (!formData.dataHora) {
      alert('Por favor, preencha a data e hora do incidente.');
      return false;
    }
    return true;
  }, [formData]);


  const enviarReclamacao = useCallback(async (isAnonimo) => {
    if (!validarCamposComuns()) return;

    if (!isAnonimo && !formData.contato) {
      alert('Para envio identificado, o E-mail ou Telefone é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reclamacao = {
        local: formData.local,
       
        dataHora: manifestacoesService.formatarDataHora(formData.dataHora), 
        descricaoDetalhada: formData.descricao,
        area: manifestacoesService.mapearAreaParaBackend(formData.setor),
        
        caminhoAnexo: formData.anexo ? formData.anexo.name : null 
      };
      
      const criado = await manifestacoesService.criarReclamacao(reclamacao);
      
      
      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch (e) {
          console.error('Erro ao salvar setor no localStorage:', e);
      }
      
      alert(`Reclamação ${isAnonimo ? 'anônima ' : ''}enviada com sucesso!`);
      navigate('/confirmacao');
    } catch (err) {
      console.error(`Erro ao enviar reclamação ${isAnonimo ? 'anônima' : ''}:`, err);
      setError('Erro ao enviar reclamação. Tente novamente.');
      alert('Erro ao enviar reclamação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, validarCamposComuns]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    enviarReclamacao(false); 
  };
  
  const handleAnonimoSubmit = (e) => {
    e.preventDefault(); 
    enviarReclamacao(true);
  };


  return (
    <div className="reclamacao-container">
      <HeaderSimples />
      <SetaVoltar />
      
      <div className="reclamacao-content">
        
        <h2 className="titulo-pagina">Faça uma Reclamação</h2>
        
        <div className="instrucoes-preenchimento">
          <p><strong>* Campos Obrigatórios</strong></p>
          <p>* Tamanho máximo para Anexar arquivo: 5 Megabytes.</p>
          <p>Explique em quais casos a reclamação pode ser feita e reforce a confidencialidade do processo.</p>
        </div>
        
        <div className="form-box">
          
          <form className="formulario-reclamacao" onSubmit={handleSubmit}>
            
            <label htmlFor="nome-input">Nome (opcional)</label>
            <input
              id="nome-input"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome completo (se logado, já estará preenchido)"
            />
            
            <label htmlFor="contato-input">E-mail ou Telefone *</label>
            <input
              id="contato-input"
              type="text"
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              placeholder="E-mail ou Telefone (obrigatório para envio identificado)"
              
              required 
            />
            
            <label htmlFor="setor-select">Setor de Destino *</label>
            <select
              id="setor-select"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            > 
              <option value="Geral">Outro / Geral</option>
              <option value="Informatica">Informática</option>
              <option value="Mecanica">Mecânica</option>
              <option value="Faculdade">Faculdade</option>
            </select>

            <label htmlFor="local-input">Local do incidente *</label>
            <input
              id="local-input"
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: Sala B-10, Pátio, Oficina de Mecânica..."
              required
            />
            
            <label htmlFor="datahora-input">Data e Hora do incidente *</label>
            <input
              id="datahora-input"
              type="datetime-local" 
              name="dataHora"
              value={formData.dataHora}
              onChange={handleChange}
              required
            />
            
            <label htmlFor="descricao-textarea">Descrição detalhada da Reclamação *</label>
            <div className="textarea-container">
              <textarea
                id="descricao-textarea"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={6}
                placeholder="Descreva detalhadamente o ocorrido..."
                required
              />
              
              <label htmlFor="file-upload-reclamacao" className="custom-file-upload">
                <img
                  src={IconeAnexo}
                  alt="Anexar"
                  className="icone-anexar"
                />
              </label>
              <input
                id="file-upload-reclamacao" 
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {formData.anexo && (
                <p className="arquivo-selecionado">
                  Arquivo selecionado: **{formData.anexo.name}**
                </p>
              )}

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview do anexo"
                  style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                />
              )}
            </div>
            
            <small>Atenção: Evite compartilhar imagens que possam comprometer sua segurança ou de outra pessoa.</small>
            
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
              <button
                type="submit" 
                className="btn-confirmar"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Confirmar'}
              </button>
              <button
                type="button" 
                className="btn-confirmar"
                style={{ backgroundColor: '#666' }}
                onClick={handleAnonimoSubmit} 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Anônimo'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Reclamacao;