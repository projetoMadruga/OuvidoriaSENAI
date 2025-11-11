import React, { useState, useEffect } from 'react';
import './ModalGerenciar.css'; 

const { createElement: e } = React;

const normalizeString = (str) => {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};


function ModalGerenciar({ onClose, manifestacao, onSaveResponse, readOnly = false, adminSetor }) {
    
    const { 
        respostaAdmin = '', 
        status = 'Pendente',
        tipo = 'Manifestação' 
    } = manifestacao || {};

    const setorManifestacaoNormalizado = normalizeString(manifestacao?.setor); 
    const tipoManifestacaoNormalizado = normalizeString(manifestacao?.tipo);
    const adminSetorNormalizado = normalizeString(adminSetor); 

    let podeEditarPelaRegra = false;

    if (!readOnly) { 
        switch (adminSetorNormalizado) {
            case 'geral':
                podeEditarPelaRegra = true;
                break;
            case 'faculdade':
                if (setorManifestacaoNormalizado === 'faculdade' || setorManifestacaoNormalizado === 'geral') {
                    podeEditarPelaRegra = true;
                }
                break;
            case 'informatica':
                if (setorManifestacaoNormalizado === 'informatica' || setorManifestacaoNormalizado === 'geral') {
                    podeEditarPelaRegra = true;
                }
                break;
            case 'mecanica':
                const isReclamacao = tipoManifestacaoNormalizado === 'reclamacao' || tipoManifestacaoNormalizado === 'reclamação';
                if (setorManifestacaoNormalizado === 'mecanica' || setorManifestacaoNormalizado === 'geral' || isReclamacao) {
                    podeEditarPelaRegra = true;
                }
                break;
            default:
                podeEditarPelaRegra = false;
        }
    }
    
    const canEdit = podeEditarPelaRegra && !readOnly; 

    const [resposta, setResposta] = useState(respostaAdmin);
    const [novoStatus, setNovoStatus] = useState(status);
    const [novoSetor, setNovoSetor] = useState(manifestacao?.setor || 'Geral');
    
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        setResposta(respostaAdmin);
        setNovoStatus(status);
        setNovoSetor(manifestacao?.setor || 'Geral');
        
        setIsEditing(false); 
        
    }, [manifestacao]); 

    if (!manifestacao) {
        return null;
    }

    const handleSave = () => {
        if (!canEdit) {
            alert('Ação bloqueada: Você não tem permissão para editar esta manifestação.');
            return;
        }

        if (!resposta && (novoStatus !== 'Pendente')) {
            alert('A resposta do administrador é obrigatória ao alterar o status para Em Andamento ou Resolvida.');
            return;
        }

        if (onSaveResponse) {
            onSaveResponse(manifestacao.id, novoStatus, resposta, novoSetor);
        }
        setIsEditing(false);
    };
    
    const renderStatusLabel = (s) => {
        const statusClass = s ? s.toLowerCase().replace(/\s/g, '-') : 'pendente';
        return e('span', { className: `status-label ${statusClass}` }, s || 'Pendente');
    };

    const imagemSrc = manifestacao.anexoBase64 || manifestacao.imagemBase64 || manifestacao.imagem || manifestacao.anexo;
    
    const modalTitle = canEdit 
        ? `Gerenciar Manifestação: ${tipo || 'N/A'}` 
        : `Visualizando Manifestação: ${tipo || 'N/A'}`;

    const contentEditing = [
        e('h3', { key: 'h3-admin-edit' }, 'Responder e Atualizar Status'),

        e('label', { key: 'label-setor' }, [
            e('strong', null, 'Setor:'),
            e('select', {
                key: 'select-setor',
                value: novoSetor,
                onChange: (e) => setNovoSetor(e.target.value)
            }, [
                e('option', { key: 'set-geral', value: 'Geral' }, 'Geral'),
                e('option', { key: 'set-info', value: 'Informatica' }, 'Informática'),
                e('option', { key: 'set-mec', value: 'Mecanica' }, 'Mecânica'),
                e('option', { key: 'set-fac', value: 'Faculdade' }, 'Faculdade')
            ])
        ]),
        
        e('label', { key: 'label-status' }, [ 
            e('strong', null, 'Novo Status:'), 
            e('select', {
                key: 'select-status',
                value: novoStatus,
                onChange: (e) => setNovoStatus(e.target.value)
            }, [
                e('option', { key: 'op1', value: 'Pendente' }, 'Pendente'),
                e('option', { key: 'op2', value: 'Em Andamento' }, 'Em Andamento'),
                e('option', { key: 'op3', value: 'Resolvida' }, 'Resolvida')
            ])
        ]),

        e('label', { key: 'label-resposta' }, [ 
            e('strong', null, 'Resposta do Admin:'), 
            e('textarea', {
                key: 'textarea-resposta',
                value: resposta, 
                onChange: (e) => setResposta(e.target.value),
                placeholder: 'Descreva a resolução ou andamento...',
                rows: 5
            })
        ]),
        
        e('div', { key: 'modal-actions-edit', className: 'modal-actions' }, [
            e('button', { 
                key: 'btn-salvar', 
                className: 'btn-primary', 
                onClick: handleSave 
            }, 'Salvar Resposta'),
            e('button', { 
                key: 'btn-cancelar', 
                className: 'btn-secondary', 
                onClick: () => {
                    setResposta(respostaAdmin); 
                    setNovoStatus(status);
                    setNovoSetor(manifestacao?.setor || 'Geral');
                    setIsEditing(false);
                } 
            }, 'Cancelar Edição')
        ])
    ];

    const contentView = [
        e('h3', { key: 'h3-admin-view' }, 'Resposta da Administração'),
        e('p', { key: 'resposta-salva' }, [e('strong', null, 'Resposta: '), manifestacao.respostaAdmin || 'Nenhuma resposta registrada.']),
        e('p', { key: 'data-resposta' }, [e('strong', null, 'Data da Resposta: '), manifestacao.dataResposta || 'N/A']),
        
        e('div', { key: 'modal-actions-view', className: 'modal-actions' }, [
            canEdit && e('button', { 
                key: 'btn-editar', 
                className: 'btn-secondary', 
                onClick: () => {
                    setResposta(respostaAdmin); 
                    setNovoStatus(status);
                    setIsEditing(true);
                }
            }, 'Editar Resposta'),
            
            e('button', { 
                key: 'btn-fechar', 
                className: 'btn-primary', 
                onClick: onClose 
            }, 'Fechar')
        ])
    ];


    return e(
        'div',
        { className: 'modal-overlay', onClick: onClose },
        e(
            'div',
            { 
                className: 'modal-content modal-gerenciar', 
                onClick: (e) => e.stopPropagation() 
            },
            [
                e('div', { key: 'header', className: 'modal-header' }, [
                    e('h2', { key: 'title' }, modalTitle),
                    e('button', { key: 'close', className: 'close-button', onClick: onClose }, '×')
                ]),

                e('div', { key: 'body', className: 'modal-body' }, [
                    e('p', { key: 'nome' }, [e('strong', null, 'Nome: '), manifestacao.nome]),
                    e('p', { key: 'contato' }, [e('strong', null, 'Contato: '), manifestacao.contato]),
                    e('p', { key: 'dataCriacao' }, [e('strong', null, 'Data Criação: '), manifestacao.dataCriacao]),
                    
                    e('p', { key: 'setor-manifestacao' }, [
                        e('strong', null, 'Área Alvo: '), 
                        manifestacao.setor || 'Geral'
                    ]),
                    
                    e('p', { key: 'status-atual' }, 
                        [e('strong', null, 'Status Atual: '), renderStatusLabel(manifestacao.status)]
                    ),
                    
                    e('p', { key: 'local' }, [e('strong', null, 'Local: '), manifestacao.local || 'N/A']),
                    
                    e('p', { key: 'descricao' }, [e('strong', null, 'Descrição/Detalhes: '), manifestacao.detalhes || manifestacao.descricao || 'N/A']),
                    
                    e('div', { key: 'anexo-wrapper', className: 'manifestacao-anexo-wrapper' }, [
                        e('hr', { key: 'hr-anexo' }),
                        e('h3', { key: 'h3-anexo' }, 'Anexo (Foto)'),
                        
                        imagemSrc 
                            ? e('img', { 
                                key: 'img-anexo', 
                                src: imagemSrc, 
                                alt: 'Imagem da manifestação',
                                className: 'manifestacao-imagem' 
                              })
                            : e('p', { key: 'p-anexo' }, 'Nenhuma imagem anexada.'),
                        
                        e('hr', { key: 'hr-after-anexo' }),
                    ]),
                    
                    ...(canEdit && isEditing ? contentEditing : contentView)
                ])
            ]
        )
    );
}

export default ModalGerenciar;
