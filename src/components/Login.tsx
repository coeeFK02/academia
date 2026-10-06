"use client";

import { useState, type FormEvent } from "react";
import { erroLegivel } from "@/lib/erros";
import { supabase } from "@/lib/supabase";

/** Entra com a mesma conta do LIFE OS (e-mail e senha). */
export function Login() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const cliente = supabase();
    if (!cliente) return;
    setOcupado(true);
    setMensagem("");
    setAviso("");

    try {
      const credenciais = { email: email.trim(), password: senha };
      const { error, data } =
        modo === "entrar"
          ? await cliente.auth.signInWithPassword(credenciais)
          : await cliente.auth.signUp(credenciais);

      if (error) {
        // A mensagem do Supabase vem em inglês; as duas mais comuns ganham tradução.
        if (/invalid login credentials/i.test(error.message)) {
          setMensagem("E-mail ou senha não conferem.");
        } else if (/user already registered/i.test(error.message)) {
          setMensagem("Já existe conta com este e-mail. Toque em “Já tenho conta”.");
        } else {
          setMensagem(erroLegivel(error, "Não foi possível entrar."));
        }
      } else if (modo === "criar" && !data.session) {
        setAviso("Conta criada. Confirme o e-mail que acabou de chegar e depois entre.");
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="centro">
      <form className="cartao entrada" onSubmit={enviar}>
        <h1>Academia</h1>
        <p className="suave">Seus treinos, as séries de cada dia e a carga de cada exercício.</p>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoCapitalize="none"
            placeholder="voce@email.com"
          />
        </label>

        <label>
          Senha
          <span className="campo-com-botao">
            <input
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            />
            <button type="button" className="link" onClick={() => setMostrarSenha((v) => !v)}>
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </span>
        </label>

        {mensagem && <p className="erro">{mensagem}</p>}
        {aviso && <p className="sucesso">{aviso}</p>}

        <button className="primario grande" disabled={ocupado}>
          {ocupado ? "Um instante…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setMensagem("");
            setAviso("");
          }}
        >
          {modo === "entrar" ? "Não tenho conta" : "Já tenho conta"}
        </button>
      </form>
    </main>
  );
}
