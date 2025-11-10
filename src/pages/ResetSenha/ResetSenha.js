import React, { useState, useEffect } from 'react';

const useSearchParams = () => [new URLSearchParams(window.location.search)];

const useNavigate = () => (path) => console.log(`[NAVIGATE SIMULADO] Redirecionando para: ${path}`);

const buildUrl = (path) => {
    const API_BASE = "http://mock-api-base.com" || ""; 
    if (!API_BASE) return path; 
    if (path.startsWith("http")) return path;
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
};

const mockFetch = (url, options) => {
    const payload = JSON.parse(options.body);
    const { token, novaSenha } = payload;
    
    console.log(`[MOCK FETCH] Tentativa de redefinição para: ${url}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            if (token && novaSenha.length >= 8 && novaSenha.includes('!')) {
                resolve({ 
                    ok: true, 
                    status: 200, 
                    statusText: 'OK', 
                    text: () => Promise.resolve('Password successfully reset.') 
                });
            } else {
                resolve({ 
                    ok: false, 
                    status: 400, 
                    statusText: 'Bad Request', 
                    text: () => Promise.resolve('Token expirado/inválido ou senha fraca (MOCK: precisa de "!").') 
                });
            }
        }, 1500);
    });
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
            setError('Token inválido ou ausente. Verifique o link de redefinição.');
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
            
            const response = await mockFetch(buildUrl('/login/redefinir-senha'), {
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
                
                if (response.status === 400 || response.status === 500) {
                    setError(errorText || 'Erro no servidor ou token inválido/expirado.');
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

    return e('div', { className: 'min-h-screen flex items-center justify-center p-4 bg-gray-100 font-[Inter]' }, [
        e('script', { key: 'tailwind', src: 'https://cdn.tailwindcss.com' }),

        e('div', { className: 'w-full max-w-md p-8 bg-white shadow-2xl rounded-xl transition-all duration-300 border-t-4 border-indigo-600' }, [
            e('h1', { key: 'main-title', className: 'text-3xl font-bold text-center text-gray-800 mb-6 border-b pb-4' }, 'Redefinir Senha'),
            
            e('p', { key: 'debug-token', className: 'text-sm text-center text-indigo-500 mb-4 bg-indigo-50 p-2 rounded-lg break-all' }, 
                `Token da URL: ${token || 'Nenhum'}`
            ),

            success
                ? e('div', { key: 'ok', className: 'text-center p-8 bg-green-50 rounded-xl border-4 border-green-400 shadow-2xl' }, [
                    e('h3', { key: 'success-title', className: 'text-4xl font-extrabold text-green-700 mb-4' }, '✅ Senha Redefinida com Sucesso!'),
                    e('p', { key: 'success-msg1', className: 'text-lg text-gray-800 mb-6' }, 'Sua senha foi alterada com sucesso.'),
                    e('p', { key: 'success-msg2', className: 'text-base text-gray-600' }, 'Redirecionando para a página inicial...')
                ])
                : e('form', { key: 'form', onSubmit: handleSubmit, className: 'space-y-6' }, [
                    
                    e('div', { key: 'senha' }, [
                        e('label', { htmlFor: 'novaSenha', className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Nova senha'),
                        e('input', {
                            id: 'novaSenha',
                            type: 'password',
                            value: novaSenha,
                            onChange: (ev) => setNovaSenha(ev.target.value),
                            required: true,
                            minLength: 8,
                            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-base',
                            placeholder: 'Mínimo 8 caracteres',
                        })
                    ]),
                    
                    e('div', { key: 'confirm' }, [
                        e('label', { htmlFor: 'confirmacao', className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Confirmar nova senha'),
                        e('input', {
                            id: 'confirmacao',
                            type: 'password',
                            value: confirmacao,
                            onChange: (ev) => setConfirmacao(ev.target.value),
                            required: true,
                            minLength: 8,
                            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-base',
                            placeholder: 'Repita a nova senha',
                        })
                    ]),
                    
                    error && e('div', { key: 'err', className: 'text-sm font-semibold p-4 bg-red-50 text-red-700 rounded-lg border border-red-300 shadow-inner' }, error),
                    
                    e('button', { 
                        key: 'submit', 
                        type: 'submit', 
                        disabled: loading, 
                        className: `w-full py-3 px-4 rounded-lg font-bold text-lg shadow-xl transition duration-300 transform ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]'}`
                    }, 
                        loading 
                        ? e('span', { key: 'loading-span', className: 'flex items-center justify-center' }, [
                            e('svg', { key: 'spinner', className: 'animate-spin h-5 w-5 mr-3 text-white', viewBox: '0 0 24 24' }, [
                                e('circle', { key: 'circle', className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }),
                                e('path', { key: 'path', className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' })
                            ]),
                            'Redefinindo senha...'
                        ])
                        : 'Redefinir Senha'
                    ),

                    e('p', { key: 'test-note', className: 'text-xs text-gray-500 text-center mt-4' }, 
                        '*Para teste, o token deve estar presente na URL e a nova senha deve conter o caractere \'!\' (ex: "Senha!123") para simular o sucesso.'
                    )
                ])
            
            ]), 
        ])
}

export default ResetSenha;