import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";
import logosenai from "../assets/imagens/logosenai.png";
import boneco from "../assets/imagens/boneco.png";
import cadeado from "../assets/imagens/cadeado.png";
import { api } from "../services/api";

function ModalLogin({ isOpen, onClose, onCadastro, onEsqueciSenha }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const redirecionarPorEmail = (email) => {
    if (email === "pino@docente.senai.br" || email === "pino@senai.br") return navigate("/admin/adm-mec");
    if (email === "chile@docente.senai.br" || email === "chile@senai.br") return navigate("/admin/adm-info");
    if (email === "diretor@senai.br") return navigate("/admin");
    if (email === "vieira@docente.senai.br" || email === "vieira@senai.br") return navigate("/admin/adm-fac");
    if (email.endsWith("@aluno.senai.br")) return navigate("/aluno");
    if (email.endsWith("@senai.br") || email.endsWith("@docente.senai.br")) return navigate("/funcionario");
    alert("E-mail não autorizado.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Chama a API de autenticação do back-end
      const response = await api.post("/login/autenticar", {
        emailEducacional: email,
        senha: senha
      });

      // Armazena os tokens JWT
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      // Armazena dados do usuário
      localStorage.setItem("usuarioLogado", JSON.stringify({ email }));

      // Redireciona baseado no email
      redirecionarPorEmail(email);
      
      // Limpa o formulário
      setEmail("");
      setSenha("");
      onClose();
    } catch (err) {
      console.error("Erro na autenticação:", err);
      
      // Trata diferentes tipos de erro
      if (err.status === 401) {
        setError("Email ou senha inválidos.");
      } else if (err.status === 400) {
        setError("Dados inválidos. Verifique os campos.");
      } else {
        setError("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: "modal-overlay", onClick: onClose },
    React.createElement(
      "div",
      { className: "modal-container", onClick: (e) => e.stopPropagation() },
      React.createElement("button", { className: "close-btn", onClick: onClose }, "×"),
      React.createElement("img", { src: logosenai, alt: "Logo SENAI", className: "logo-senai-modal" }),
      React.createElement("div", { className: "linha-vermelha" }),
      React.createElement("h2", { className: "titulo-principal" }, "Login"),
      error && React.createElement("div", { className: "error-message", style: { color: "red", marginBottom: "10px", textAlign: "center" } }, error),
      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement(
          "div",
          { className: "input-icon-container" },
          React.createElement("img", { src: boneco, alt: "usuário" }),
          React.createElement("input", {
            type: "email",
            placeholder: "E-mail institucional",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
          })
        ),
        React.createElement(
          "div",
          { className: "input-icon-container" },
          React.createElement("img", { src: cadeado, alt: "senha" }),
          React.createElement("input", {
            type: "password",
            placeholder: "Senha",
            value: senha,
            onChange: (e) => setSenha(e.target.value),
            required: true,
          })
        ),
        React.createElement("button", { type: "submit", className: "submit-btn", disabled: loading }, loading ? "Entrando..." : "Entrar")
      ),
      React.createElement(
        "div",
        { className: "actions-links" },
        React.createElement("button", { onClick: onEsqueciSenha }, "Esqueceu sua senha?"),
        React.createElement("button", { onClick: onCadastro }, "Primeiro acesso?")
      )
    )
  );
}

export default ModalLogin;
