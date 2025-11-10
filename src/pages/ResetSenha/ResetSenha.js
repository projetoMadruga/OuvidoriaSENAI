import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const buildUrl = (path) => {
    const API_BASE = process.env.REACT_APP_API_BASE || "";
    if (!API_BASE) return path;
    if (path.startsWith("http")) return path;
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
};

const { createElement: e } = React;

function ResetSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const t = searchParams.get('token') || '';
        console.log('Token capturado da URL:', t);
        setToken(t);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!token) {
            setError('Token inválido ou ausente.');
            return;
        }
        if (!novaSenha || novaSenha.length < 8) {
            setError('A nova senha deve ter pelo menos 8 caracteres.');
            return;
        }
        if (novaSenha !== confirmacao) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            console.log('Enviando payload:', { token, novaSenha: '***(oculto)***' });
            
            const response = await fetch(buildUrl('/login/redefinir-senha'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, novaSenha })
            });

            console.log('Resposta do servidor:', response.status, response.statusText);

            if (response.ok) {
                const responseText = await response.text();
                console.log('Senha redefinida com sucesso:', responseText);
                setSuccess(true);
                setError('');
                setTimeout(() => navigate('/'), 3000);
            } else {
                const errorText = await response.text();
                console.error('Erro ao redefinir senha:', response.status, errorText);
                
                if (response.status === 400) {
                    setError(errorText || 'Token inválido/expirado ou senha fraca.');
                } else if (response.status === 500) {
                    setError('Erro interno do servidor. Tente novamente mais tarde.');
                } else {
                    setError('Falha ao redefinir senha. Verifique sua conexão e tente novamente.');
                }
            }
        } catch (err) {
            console.error('Erro de rede ao redefinir senha:', err);
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return e('div', { className: 'reset-senha-container', style: { maxWidth: 420, margin: '40px auto', padding: 16 } }, [
        e('h2', { key: 'title' }, 'Redefinir Senha'),
        success
            ? e('div', { key: 'ok', style: { color: 'green', marginTop: 12, textAlign: 'center' } }, [
                e('h3', { key: 'success-title' }, '✅ Senha Redefinida com Sucesso!'),
                e('p', { key: 'success-msg1' }, 'Sua senha foi alterada com sucesso.'),
                e('p', { key: 'success-msg2' }, 'Redirecionando para a página inicial...')
            ])
            : e('form', { key: 'form', onSubmit: handleSubmit }, [
                e('div', { key: 'senha', style: { marginBottom: 12 } }, [
                    e('label', { htmlFor: 'novaSenha' }, 'Nova senha'),
                    e('input', {
                        id: 'novaSenha',
                        type: 'password',
                        value: novaSenha,
                        onChange: (ev) => setNovaSenha(ev.target.value),
                        required: true,
                        minLength: 8,
                        style: { width: '100%', padding: 8 }
                    })
                ]),
                e('div', { key: 'confirm', style: { marginBottom: 12 } }, [
                    e('label', { htmlFor: 'confirmacao' }, 'Confirmar nova senha'),
                    e('input', {
                        id: 'confirmacao',
                        type: 'password',
                        value: confirmacao,
                        onChange: (ev) => setConfirmacao(ev.target.value),
                        required: true,
                        minLength: 8,
                        style: { width: '100%', padding: 8 }
                    })
                ]),
                error && e('div', { key: 'err', style: { color: 'red', margin: '8px 0' } }, error),
                e('button', { key: 'submit', type: 'submit', disabled: loading, style: { width: '100%', padding: 10 } }, loading ? '🔄 Redefinindo senha...' : 'Redefinir senha')
            ])
    ]);
}

export default ResetSenha;