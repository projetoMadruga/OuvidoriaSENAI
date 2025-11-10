// ... (mantenha os imports e o novo 'import IconeAnexo...')

function Denuncia() {
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
  // Removido 'anexoBase64' e 'setAnexoBase64' para evitar erros de linter (variável não utilizada)
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
    if (!file) {
      setFormData(prevState => ({ ...prevState, anexo: null }));
      setPreviewUrl(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
      e.target.value = '';
      setFormData(prevState => ({ ...prevState, anexo: null }));
      setPreviewUrl(null);
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      anexo: file
    }));

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Remoção da lógica do FileReader (base64) pois a variável não era usada.
      // Isso evita erros de linter/build.
    } else {
      setPreviewUrl(null);
    }
  };

  const validarCamposComuns = () => {
    if (!formData.descricao) {
      alert('Por favor, preencha a descrição detalhada da denúncia.');
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
      const denuncia = {
        local: formData.local,
        dataHora: manifestacoesService.formatarDataHora(formData.dataHora),
        descricaoDetalhada: formData.descricao,
        area: manifestacoesService.mapearAreaParaBackend(formData.setor),
        caminhoAnexo: formData.anexo ? formData.anexo.name : null
      };

      const criado = await manifestacoesService.criarDenuncia(denuncia);
      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch {}
      alert('Denúncia enviada com sucesso!');
      navigate('/confirmacao');
    } catch (err) {
      console.error('Erro ao enviar denúncia:', err);
      setError('Erro ao enviar denúncia. Tente novamente.');
      alert('Erro ao enviar denúncia. Tente novamente.');
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
      const denuncia = {
        local: formData.local,
        dataHora: manifestacoesService.formatarDataHora(formData.dataHora),
        descricaoDetalhada: formData.descricao,
        area: manifestacoesService.mapearAreaParaBackend(formData.setor),
        caminhoAnexo: formData.anexo ? formData.anexo.name : null
      };

      const criado = await manifestacoesService.criarDenuncia(denuncia);
      try {
        if (criado && criado.id) {
          const raw = localStorage.getItem('setorOverridesById');
          const map = raw ? JSON.parse(raw) : {};
          map[criado.id] = formData.setor;
          localStorage.setItem('setorOverridesById', JSON.stringify(map));
        }
      } catch {}
      alert('Denúncia anônima enviada com sucesso!');
      navigate('/confirmacao');
    } catch (err) {
      console.error('Erro ao enviar denúncia anônima:', err);
      setError('Erro ao enviar denúncia. Tente novamente.');
      alert('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="denuncia-container">
      <HeaderSimples />
      <SetaVoltar />
      <div className="denuncia-content">
        <h2 className="titulo-pagina">Faça uma denúncia</h2>
        <div className="instrucoes-preenchimento">
          <p><strong>* Campos Obrigatórios</strong></p>
          <p>* Tamanho máximo para Anexar arquivo: 5 Megabytes.</p>
          <p>Explique em quais casos a denúncia pode ser feita e reforce a confidencialidade do processo.</p>
        </div>
        <div className="form-box">
          <form className="formulario-denuncia" onSubmit={handleSubmit}>
            <label>Nome (opcional)</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome completo (se logado, já estará preenchido)"
            />
            <label>E-mail ou Telefone *</label>
            <input
              type="text"
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              placeholder="E-mail ou Telefone (obrigatório para envio identificado)"
              required
            />
            <label>Setor de Destino *</label>
            <select
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            >
              <option key="geral" value="Geral">Outro / Geral</option>
              <option key="info" value="Informatica">Informática</option>
              <option key="mec" value="Mecanica">Mecânica</option>
              <option key="fac" value="Faculdade">Faculdade</option>
            </select>
            <label>Local do incidente *</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: Sala B-10, Pátio, Oficina de Mecânica..."
              required
            />
            <label>Data e Hora do incidente *</label>
            <input
              type="datetime-local"
              name="dataHora"
              value={formData.dataHora}
              onChange={handleChange}
              required
            />
            <label>Descrição detalhada da denúncia *</label>
            <div className="textarea-container">
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={6}
                placeholder="Descreva detalhadamente o ocorrido..."
                required
              ></textarea>
              <label htmlFor="file-upload-denuncia" className="custom-file-upload">
                <img
                  src={IconeAnexo} // <--- MUDANÇA AQUI: Agora usa a variável importada
                  alt="Anexar"
                  className="icone-anexar"
                />
              </label>
              <input
                id="file-upload-denuncia"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {formData.anexo && (
                <p className="arquivo-selecionado">
                  Arquivo selecionado: {formData.anexo.name}
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
              <button type="submit" className="btn-confirmar" disabled={loading}>
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

export default Denuncia;