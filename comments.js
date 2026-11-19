const Comments = {
  atual: null,
  abrir(id) {
    this.atual = id;
    this.desenhar();
    document.getElementById("drawer").hidden = false;
    document.getElementById("ctexto").focus();
  },
  fechar() { document.getElementById("drawer").hidden = true; this.atual = null; },
  desenhar() {
    const p = Feed.posts.find(x => x.id === this.atual);
    const ul = document.getElementById("clist");
    ul.innerHTML = "";
    if (!p.comentarios.length) {
      const li = document.createElement("li");
      li.className = "vazio"; li.textContent = "Sem comentários. Os outros 2 estão a ignorar-te.";
      ul.appendChild(li);
    }
    p.comentarios.forEach(c => {
      const u = USERS.find(x => x.id === c.user);
      const li = document.createElement("li");
      const b = document.createElement("b");
      b.textContent = u.emoji + " " + u.nome + ": ";
      li.append(b, document.createTextNode(c.texto));
      ul.appendChild(li);
    });
  },
  enviar() {
    const inp = document.getElementById("ctexto");
    const texto = inp.value.trim();
    if (!texto) { toast("Comentário vazio. Que mistério profundo."); return; }
    Feed.posts.find(x => x.id === this.atual).comentarios.push({ user: Auth.user().id, texto });
    inp.value = "";
    Feed.guardar();
    this.desenhar();
    Feed.desenhar();
  }
};
