import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { manifestacoesService } from '../../services/manifestacoesService';
import '../Elogio/Elogio.css';
import Footer from '../../Components/Footer';
import HeaderSimples from '../../Components/HeaderSimples';
import SetaVoltar from '../../Components/SetaVoltar';

function Elogio() {
  const navigate = useNavigate();

  const usuarioLogado = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('usuarioLogado');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
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

    if (!file) {
        setFormData(prevState => ({ ...prevState, anexo: null }));
        setPreviewUrl(null);
        return;
    }

    if (file.size > MAX_SIZE) {
      alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
      e.target.value = null;
      setFormData(prevState => ({ ...prevState, anexo: null }));
      setPreviewUrl(null);
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      anexo: file
    }));

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file.type.startsWith('image/')) {
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
    if (!formData.descricao || formData.descricao.trim() === '') {
      alert('Por favor, preencha a descrição detalhada do elogio.');
      return false;
    }
    
    if (formData.dataHora) {
        const dataIncidente = new Date(formData.dataHora);
        const dataAtual = new Date();
        dataAtual.setMilliseconds(0); 
        dataIncidente.setSeconds(0);
    
        if (dataIncidente > dataAtual) {
            alert('A data e hora não pode ser no futuro.');
            return false;
        }
    }
    
    return true;
  }, [formData]);

  const enviarElogio = useCallback(async (e, isAnonimo) => {
    e.preventDefault();
    
    if (!validarCamposComuns()) return;

    const finalNome = isAnonimo ? '' : formData.nome;
    const finalContato = isAnonimo ? '' : formData.contato;
    const tipoEnvio = isAnonimo ? 'anônimo' : '';

    if (!isAnonimo && !finalContato) { 
      alert('Para envio identificado, o E-mail ou Telefone é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataHoraEnvio = formData.dataHora 
        ? manifestacoesService.formatarDataHora(formData.dataHora) 
        : manifestacoesService.formatarDataHora(new Date().toISOString().slice(0, 16));
        
      const formDataToSend = new FormData();
        
      formDataToSend.append('nome', finalNome);
      formDataToSend.append('contato', finalContato);
      formDataToSend.append('setor', formData.setor);
      formDataToSend.append('local', formData.local || 'Não informado');
      formDataToSend.append('dataHora', dataHoraEnvio);
      formDataToSend.append('descricaoDetalhada', formData.descricao);

      if (formData.anexo) {
          formDataToSend.append('anexo', formData.anexo, formData.anexo.name);
      }
      
      const criado = await manifestacoesService.criarElogio(formDataToSend);

      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch (err) {
        console.error('Erro ao salvar setor no localStorage:', err);
      }
      
      alert(`Elogio ${tipoEnvio} enviado com sucesso!`);
      navigate('/confirmacao');
    } catch (err) {
      console.error(`Erro ao enviar elogio ${tipoEnvio}:`, err);
      setError('Erro ao enviar elogio. Tente novamente.');
      alert('Erro ao enviar elogio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, validarCamposComuns, previewUrl]);

  return (
    <div className="elogio-container">
      <HeaderSimples />
      <SetaVoltar />
      
      <div className="elogio-content">
        
        <h2 className="titulo-pagina">Faça um Elogio</h2>
        
        <div className="instrucoes-preenchimento">
          <p><strong>* Campos Obrigatórios (apenas Descrição e Setor)</strong></p>
          <p>* Tamanho máximo para Anexar arquivo: 5 Megabytes.</p>
          <p>Utilize este formulário para elogiar uma pessoa, um serviço ou uma área da instituição.</p>
        </div>
        
        <div className="form-box">
          
          <form className="formulario-elogio" onSubmit={(e) => enviarElogio(e, false)}>
            
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

            <label htmlFor="local-input">Local (opcional)</label>
            <input
              id="local-input"
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: Sala B-10, Pátio, Oficina de Mecânica..."
            />
            
            <label htmlFor="datahora-input">Data e Hora (opcional)</label>
            <input
              id="datahora-input"
              type="datetime-local" 
              name="dataHora"
              value={formData.dataHora}
              onChange={handleChange}
            />
            
            <label htmlFor="descricao-textarea">Descrição detalhada do Elogio *</label>
            <div className="textarea-container">
              <textarea
                id="descricao-textarea"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={6}
                placeholder="Descreva detalhadamente o que deseja elogiar..."
                required
              />
              
              <label htmlFor="file-upload-elogio" className="custom-file-upload">
                <img
                  src={require('../../assets/imagens/icone-anexo.png')}
                  alt="Anexar"
                  className="icone-anexar"
                />
              </label>
              <input
                id="file-upload-elogio" 
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
                onClick={(e) => enviarElogio(e, true)}
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

export default Elogio;