import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { manifestacoesService } from '../../services/manifestacoesService';
import '../Sugestao/Sugestao.css';
import Footer from '../../Components/Footer';
import HeaderSimples from '../../Components/HeaderSimples';
import SetaVoltar from '../../Components/SetaVoltar';


function Sugestao() {
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
    // Cleanup function para revogar o URL de preview quando o componente for desmontado
    return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [usuarioLogado, previewUrl]); 

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
      e.target.value = null; // Limpa o input file
      setFormData(prevState => ({ ...prevState, anexo: null }));
      setPreviewUrl(null);
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      anexo: file
    }));

    // Revoga o URL anterior antes de criar um novo
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

  const validarCamposComuns = useCallback(() => {
    if (!formData.descricao || formData.descricao.trim() === '') {
      alert('Por favor, preencha a descrição detalhada da sugestão.');
      return false;
    }

    if (formData.dataHora) {
        const dataIncidente = new Date(formData.dataHora);
        const dataAtual = new Date();
        // Zera milissegundos e segundos para comparação
        dataAtual.setMilliseconds(0); 
        dataIncidente.setSeconds(0);
    
        if (dataIncidente > dataAtual) {
            alert('A data e hora não pode ser no futuro.');
            return false;
        }
    }
    
    return true;
  }, [formData]);

  const enviarSugestao = useCallback(async (e, isAnonimo) => {
    e.preventDefault();
    
    if (!validarCamposComuns()) return;

    const finalNome = isAnonimo ? '' : formData.nome;
    const finalContato = isAnonimo ? '' : formData.contato;
    const tipoEnvio = isAnonimo ? 'anônima' : '';

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
        
      // Usando FormData para enviar dados mistos (texto + arquivo)
      const formDataToSend = new FormData();
        
      formDataToSend.append('nome', finalNome);
      formDataToSend.append('contato', finalContato);
      formDataToSend.append('setor', formData.setor);
      formDataToSend.append('local', formData.local || 'Não informado');
      formDataToSend.append('dataHora', dataHoraEnvio);
      formDataToSend.append('descricaoDetalhada', formData.descricao);

      if (formData.anexo) {
          // Adiciona o arquivo com o nome original
          formDataToSend.append('anexo', formData.anexo, formData.anexo.name);
      }
      
      await manifestacoesService.criarSugestao(formDataToSend);
      
      alert(`Sugestão ${tipoEnvio} enviada com sucesso!`);
      navigate('/confirmacao');
    } catch (err) {
      console.error(`Erro ao enviar sugestão ${tipoEnvio}:`, err);
      setError('Erro ao enviar sugestão. Tente novamente.');
      alert('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, validarCamposComuns]);

  return (
    <div className="sugestao-container">
      <HeaderSimples />
      <SetaVoltar />
      
      <div className="sugestao-content">
        
        <h2 className="titulo-pagina">Faça uma Sugestão</h2>
        
        <div className="instrucoes-preenchimento">
          <p><strong>* Campos Obrigatórios (apenas Descrição e Setor)</strong></p>
          <p>* Tamanho máximo para Anexar arquivo: 5 Megabytes.</p>
          <p>Utilize este formulário para propor melhorias, ideias ou soluções para a instituição.</p>
        </div>
        
        <div className="form-box">
          
          <form className="formulario-sugestao" onSubmit={(e) => enviarSugestao(e, false)}>
            
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
            
            <label htmlFor="descricao-textarea">Descrição detalhada da Sugestão *</label>
            <div className="textarea-container">
              <textarea
                id="descricao-textarea"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={6}
                placeholder="Descreva detalhadamente a sua ideia ou sugestão de melhoria..."
                required
              />
              
              <label htmlFor="file-upload-sugestao" className="custom-file-upload">
                <img
                  src={require('../../assets/imagens/icone-anexo.png')}
                  alt="Anexar"
                  className="icone-anexar"
                />
              </label>
              <input
                id="file-upload-sugestao" 
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
                {loading && !formData.anexo ? 'Enviando...' : 'Confirmar'}
              </button>
              <button
                type="button" 
                className="btn-confirmar"
                style={{ backgroundColor: '#666' }}
                onClick={(e) => enviarSugestao(e, true)}
                disabled={loading}
              >
                {loading && !formData.anexo ? 'Enviando...' : 'Enviar Anônimo'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Sugestao;