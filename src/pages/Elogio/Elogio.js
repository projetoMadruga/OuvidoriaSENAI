import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { manifestacoesService } from '../../services/manifestacoesService';

import '../Elogio/Elogio.css'; 
import Footer from '../../Components/Footer';
import HeaderSimples from '../../Components/HeaderSimples';
import SetaVoltar from '../../Components/SetaVoltar';


function Elogio() {
  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

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
  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      anexo: file
    }));

    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const validarCamposComuns = () => {
 
    if (!formData.descricao) {
      alert('Por favor, preencha a descrição detalhada do elogio.');
      return false;
    }
   
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCamposComuns()) return;
    if (!formData.contato) { 
      alert('Para envio identificado, o E-mail ou Telefone é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const elogio = {
        local: formData.local || 'Não informado',
        dataHora: formData.dataHora ? manifestacoesService.formatarDataHora(formData.dataHora) : new Date().toISOString(),
        descricaoDetalhada: formData.descricao,
        area: manifestacoesService.mapearAreaParaBackend(formData.setor),
        caminhoAnexo: formData.anexo ? formData.anexo.name : null
      };

      const criado = await manifestacoesService.criarElogio(elogio);
      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch {}
      alert('Elogio enviado com sucesso!');
      navigate('/confirmacao');
    } catch (err) {
      console.error('Erro ao enviar elogio:', err);
      setError('Erro ao enviar elogio. Tente novamente.');
      alert('Erro ao enviar elogio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonimoSubmit = async (e) => {
    e.preventDefault();

    if (!validarCamposComuns()) return;

    setLoading(true);
    setError('');

    try {
      const elogio = {
        local: formData.local || 'Não informado',
        dataHora: formData.dataHora ? manifestacoesService.formatarDataHora(formData.dataHora) : new Date().toISOString(),
        descricaoDetalhada: formData.descricao,
        area: manifestacoesService.mapearAreaParaBackend(formData.setor),
        caminhoAnexo: formData.anexo ? formData.anexo.name : null
      };

      const criado = await manifestacoesService.criarElogio(elogio);
      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch {}
      alert('Elogio anônimo enviado com sucesso!');
      navigate('/confirmacao');
    } catch (err) {
      console.error('Erro ao enviar elogio anônimo:', err);
      setError('Erro ao enviar elogio. Tente novamente.');
      alert('Erro ao enviar elogio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'elogio-container' },
    React.createElement(HeaderSimples, null),
    React.createElement(SetaVoltar, null),
    React.createElement(
      'div',
      { className: 'elogio-content' },
     
      React.createElement('h2', { className: 'titulo-pagina' }, 'Faça um Elogio'),
      React.createElement(
        'div',
        { className: 'instrucoes-preenchimento' },
        React.createElement('p', null, React.createElement('strong', null, '* Campos Obrigatórios (apenas Descrição e Setor)')),
        React.createElement('p', null, '* Tamanho máximo para Anexar arquivo: 5 Megabytes.'),
        
        React.createElement('p', null, 'Utilize este formulário para elogiar uma pessoa, um serviço ou uma área da instituição.')
      ),
      React.createElement(
        'div',
        { className: 'form-box' },
        React.createElement(
          'form',
          { className: 'formulario-elogio', onSubmit: handleSubmit }, 
          
          React.createElement('label', null, 'Nome (opcional)'),
          React.createElement('input', {
            type: 'text',
            name: 'nome',
            value: formData.nome,
            onChange: handleChange,
            placeholder: 'Nome completo (se logado, já estará preenchido)'
          }),
          
          React.createElement('label', null, 'E-mail ou Telefone *'),
          React.createElement('input', {
            type: 'text',
            name: 'contato',
            value: formData.contato,
            onChange: handleChange,
            placeholder: 'E-mail ou Telefone (obrigatório para envio identificado)',
            required: true 
          }),
          
          React.createElement('label', null, 'Setor de Destino *'),
          React.createElement('select', {
            name: 'setor',
            value: formData.setor,
            onChange: handleChange,
            required: true
          }, 
            [
              React.createElement('option', { key: 'geral', value: 'Geral' }, 'Outro / Geral'),
              React.createElement('option', { key: 'info', value: 'Informatica' }, 'Informática'),
              React.createElement('option', { key: 'mec', value: 'Mecanica' }, 'Mecânica'),
              React.createElement('option', { key: 'fac', value: 'Faculdade' }, 'Faculdade')
            ]
          ),

          React.createElement('label', null, 'Local (opcional)'),
          React.createElement('input', {
            type: 'text',
            name: 'local',
            value: formData.local,
            onChange: handleChange,
            placeholder: 'Ex: Sala B-10, Pátio, Oficina de Mecânica...'
          }),
          
          React.createElement('label', null, 'Data e Hora (opcional)'),
          React.createElement('input', {
            type: 'datetime-local', 
            name: 'dataHora',
            value: formData.dataHora,
            onChange: handleChange,
            
          }),
          
        
          React.createElement('label', null, 'Descrição detalhada do Elogio *'),
          React.createElement(
            'div',
            { className: 'textarea-container' },
            React.createElement('textarea', {
              name: 'descricao',
              value: formData.descricao,
              onChange: handleChange,
              rows: 6,
              placeholder: 'Descreva detalhadamente o que deseja elogiar...',
              required: true
            }),
            React.createElement(
              'label',
              { htmlFor: 'file-upload-elogio', className: 'custom-file-upload' }, 
              React.createElement('img', {
                src: require('../../assets/imagens/icone-anexo.png'),
                alt: 'Anexar',
                className: 'icone-anexar'
              })
            ),
            React.createElement('input', {
              id: 'file-upload-elogio', 
              type: 'file',
              onChange: handleFileChange,
              style: { display: 'none' }
            }),

            formData.anexo &&
              React.createElement(
                'p',
                { className: 'arquivo-selecionado' },
                'Arquivo selecionado: ',
                formData.anexo.name
              ),

            previewUrl &&
              React.createElement('img', {
                src: previewUrl,
                alt: 'Preview do anexo',
                style: { marginTop: '10px', maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }
              })
          ),
          
          React.createElement('small', null, 'Atenção: Evite compartilhar imagens que possam comprometer sua segurança ou de outra pessoa.'),
          
          React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' } },
            React.createElement(
              'button',
              { type: 'submit', className: 'btn-confirmar' },
              'Confirmar'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                className: 'btn-confirmar',
                style: { backgroundColor: '#666' },
                onClick: handleAnonimoSubmit
              },
              'Enviar Anônimo'
            )
          )
        )
      )
    ),
    React.createElement(Footer, null)
  );
}

export default Elogio;
