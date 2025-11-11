import { api } from "./api";

// Attempts authentication and stores token + user info
export async function login({ email, senha }) {
  try {
    const resp = await api.post("/login/autenticar", { email, senha });
    // Flexible parsing for token field names
    const token = resp?.token || resp?.accessToken || resp?.jwt || resp?.data?.token;
    if (!token) throw new Error("Token não retornado pelo servidor");

    localStorage.setItem("authToken", token);

    // Persist basic user info if provided
    const usuario = resp?.usuario || resp?.user || { email };
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    return { token, usuario };
  } catch (err) {
    throw err;
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("usuarioLogado");
}

export function getToken() {
  return localStorage.getItem("authToken");
}
