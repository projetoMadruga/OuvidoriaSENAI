import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import "./RedefinirSenha.css";
import logosenai from "../../assets/imagens/logosenai.png";

// Função para construir URL (copiada do api.js)
const buildUrl = (path) => {
  const API_BASE = process.env.REACT_APP_API_BASE || "";
  if (!API_BASE) return path; // fallback for local dev
  if (path.startsWith("http")) return path;
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [tokenValido, setTokenValido] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setErro("Token não fornecido. Link inválido.");
      setTokenValido(false);
    }
  }, [token]);

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setErro("");

    // Validações
    if (novaSenha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildUrl("/login/redefinir-senha"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          novaSenha: novaSenha
        })
      });

      console.log("Resposta do servidor:", response.status, response.statusText);

      if (response.ok) {
        const responseText = await response.text();
        console.log("Senha redefinida com sucesso:", responseText);
        setSucesso(true);
        setErro(""); // Limpa qualquer erro anterior

        // Redireciona para home após 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        // Tratar erro
        const errorText = await response.text();
        console.error("Erro ao redefinir senha:", response.status, errorText);
        
        if (response.status === 400) {
          setErro(errorText || "Token inválido ou expirado.");
        } else if (response.status === 500) {
          setErro("Erro interno do servidor. Tente novamente mais tarde.");
        } else {
          setErro("Erro ao redefinir senha. Verifique sua conexão e tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro de rede ao redefinir senha:", error);
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValido) {
    return (
      <div className="redefinir-senha-container">
        <div className="redefinir-senha-card">
          <img src={logosenai} alt="Logo SENAI" className="logo-senai" />
          <div className="linha-vermelha"></div>
          <h2>Link Inválido</h2>
          <p className="erro-mensagem">{erro}</p>
          <button onClick={() => navigate("/")} className="btn-voltar">
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="redefinir-senha-container">
        <div className="redefinir-senha-card">
          <img src={logosenai} alt="Logo SENAI" className="logo-senai" />
          <div className="linha-vermelha"></div>
          <h2>✅ Senha Redefinida com Sucesso!</h2>
          <p className="sucesso-mensagem">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
          </p>
          <p className="sucesso-mensagem">
            Você será redirecionado para a página inicial em alguns segundos...
          </p>
          <button onClick={() => navigate("/")} className="btn-voltar">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="redefinir-senha-container">
      <div className="redefinir-senha-card">
        <img src={logosenai} alt="Logo SENAI" className="logo-senai" />
        <div className="linha-vermelha"></div>
        <h2>Redefinir Senha</h2>
        <p className="instrucoes">Digite sua nova senha abaixo.</p>

        <form onSubmit={handleRedefinirSenha}>
          <div className="input-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <input
              type="password"
              id="novaSenha"
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              placeholder="Confirme sua nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {erro && <p className="erro-mensagem">{erro}</p>}

          <button type="submit" className="btn-redefinir" disabled={loading}>
            {loading ? "🔄 Redefinindo senha..." : "Redefinir Senha"}
          </button>
        </form>

        <button onClick={() => navigate("/")} className="btn-voltar-link">
          Voltar para Home
        </button>
      </div>
    </div>
  );
}

export default RedefinirSenha;
