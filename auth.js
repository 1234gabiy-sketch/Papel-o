const Auth = {
  me: null,
  registo: false,
  async init() {
    try { const r = await API.get("/api/eu"); this.me = r.me; this.vagas(r.vagas); } catch (e) {}
    return this.me;
  },
  vagas(n) {
    $("vagas").textContent = n > 0 ? "Vagas livres: " + n + " de 3. Corre." : "Lista cheia: 3 de 3. Só entra quem já tem conta.";
  },
  aba(registo) {
    this.registo = registo;
    $("entrar").textContent = registo ? "Criar conta" : "Entrar";
    $("aba").textContent = registo ? "Já tenho conta" : "Criar conta nova";
    $("err").textContent = "";
  },
  async enviar() {
    try {
      const r = await API.post(this.registo ? "/api/registo" : "/api/login", { nome: $("nome").value.trim(), pass: $("pass").value });
      API.guardar(r.token);
      this.me = { nome: r.nome, emoji: r.emoji };
      return true;
    } catch (e) { $("err").textContent = e.message; return false; }
  },
  sair() { API.guardar(""); location.reload(); }
};
