const Auth = {
  escolhido: null,
  user() { return USERS.find(u => u.id === DB.load("sessao", null)) || null; },
  desenhar() {
    const box = document.getElementById("perfis");
    box.innerHTML = "";
    USERS.forEach(u => {
      const b = document.createElement("button");
      b.className = "perfil" + (this.escolhido === u.id ? " sel" : "");
      b.textContent = u.emoji;
      const s = document.createElement("small");
      s.textContent = u.nome;
      b.appendChild(s);
      b.onclick = () => { this.escolhido = u.id; this.desenhar(); };
      box.appendChild(b);
    });
  },
  entrar() {
    const err = document.getElementById("err");
    if (!this.escolhido) { err.textContent = escolhe(TROLL.semPerfil); return false; }
    if (document.getElementById("pin").value !== PIN) { err.textContent = escolhe(TROLL.pinErrado); return false; }
    DB.save("sessao", this.escolhido);
    return true;
  },
  sair() { DB.save("sessao", null); }
};
