"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { carregarConfig, supabase } from "@/lib/supabase";
import { erroLegivel } from "@/lib/erros";
import { carregarTreinos } from "@/lib/repositorio";
import { type Treino } from "@/lib/treino";
import { Login } from "./Login";
import { Inicio } from "./Inicio";
import { Sessao } from "./Sessao";

/** A tela aberta. Só guarda o id: os dados vêm de `treinos`, sempre atualizados. */
type Tela = { nome: "inicio" } | { nome: "sessao"; treinoId: string };

export function App() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tela, setTela] = useState<Tela>({ nome: "inicio" });
  const [erro, setErro] = useState("");
  /** null enquanto a configuração do Supabase ainda está sendo lida do servidor. */
  const [configurado, setConfigurado] = useState<boolean | null>(null);

  useEffect(() => {
    let vivo = true;
    let inscricao: { unsubscribe(): void } | null = null;

    (async () => {
      const config = await carregarConfig();
      if (!vivo) return;

      const cliente = config ? supabase() : null;
      setConfigurado(Boolean(cliente));
      if (!cliente) return;

      const { data } = await cliente.auth.getSession();
      if (!vivo) return;
      setSessao(data.session);
      inscricao = cliente.auth.onAuthStateChange((_evento, atual) => setSessao(atual)).data.subscription;
    })();

    return () => {
      vivo = false;
      inscricao?.unsubscribe();
    };
  }, []);

  const recarregar = useCallback(async () => {
    try {
      setErro("");
      setTreinos(await carregarTreinos());
    } catch (falha) {
      setErro(erroLegivel(falha, "Não foi possível carregar os treinos."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (sessao) void recarregar();
    else if (sessao === null) {
      setTreinos([]);
      setCarregando(false);
    }
  }, [sessao, recarregar]);

  /**
   * O botão "voltar" do celular fecha a tela aberta em vez de sair do app.
   *
   * Cada ida para uma tela interna empilha uma entrada no histórico; o voltar
   * do sistema a desempilha e cai aqui.
   */
  useEffect(() => {
    const aoVoltar = () => setTela({ nome: "inicio" });
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const abrir = useCallback((proxima: Tela) => {
    setErro("");
    setTela(proxima);
    try {
      window.history.pushState({ academia: true }, "");
    } catch {
      // Sem histórico disponível: a navegação por dentro do app continua valendo.
    }
  }, []);

  const voltarAoInicio = useCallback(() => {
    if (window.history.state?.academia) window.history.back();
    else setTela({ nome: "inicio" });
  }, []);

  /** Muda os treinos já carregados sem ir ao servidor. */
  const aplicar = useCallback((mudar: (treinos: Treino[]) => Treino[]) => setTreinos(mudar), []);

  // Ainda lendo a configuração: nada na tela, para não piscar uma mensagem de erro que pode não ser verdade.
  if (configurado === null) return <main className="centro" />;

  if (configurado === false) {
    return (
      <main className="centro">
        <div className="cartao">
          <h1>Academia</h1>
          <p>Falta apontar para o Supabase.</p>
          <p className="suave">
            Aqui na sua máquina: copie o <code>.env.example</code> para <code>.env.local</code> e preencha.
          </p>
          <p className="suave">
            No site publicado: defina <code>SUPABASE_URL</code> e <code>SUPABASE_ANON_KEY</code> nas variáveis do
            serviço e publique de novo.
          </p>
        </div>
      </main>
    );
  }

  // Ainda perguntando ao Supabase quem está logado: não mostra nada para não piscar a tela de login.
  if (sessao === undefined) return <main className="centro" />;
  if (sessao === null) return <Login />;

  const treinoDaTela = tela.nome === "sessao" ? treinos.find((t) => t.id === tela.treinoId) : undefined;

  return (
    <div className="app">
      <header className="topo">
        <button className="link marca" onClick={voltarAoInicio}>
          Academia
        </button>
        <button className="link" onClick={() => void supabase()?.auth.signOut()}>
          Sair
        </button>
      </header>

      {erro && (
        <div className="aviso" role="alert">
          <p>{erro}</p>
          <button className="icone" aria-label="Fechar aviso" onClick={() => setErro("")}>
            ✕
          </button>
        </div>
      )}

      {tela.nome === "inicio" && (
        <Inicio
          treinos={treinos}
          carregando={carregando}
          onComecar={(treinoId) => abrir({ nome: "sessao", treinoId })}
        />
      )}

      {tela.nome === "sessao" &&
        (treinoDaTela ? (
          <Sessao
            key={treinoDaTela.id}
            treino={treinoDaTela}
            aplicar={aplicar}
            onSair={voltarAoInicio}
            onErro={setErro}
          />
        ) : (
          <p className="suave">Treino não encontrado.</p>
        ))}
    </div>
  );
}
