// Um post de cada vez. Direita = seguinte, esquerda = anterior, baixo = perfil.
const Feed = {
  lista: [],
  i: 0,
  mudo: true,

  async carregar() {
    const atual = this.lista[this.i];
    this.lista = await API.get("/api/posts");
    const k = atual ? this.lista.findIndex(p => p.id === atual.id) : -1;
    this.i = k >= 0 ? k : 0;
    return k >= 0;
  },
  async iniciar() { await this.carregar(); this.desenhar(""); },
  async atualizar() { if (await this.carregar()) this.contagens(); else this.desenhar(""); },

  lado(p) {
    return `<button data-a="like" class="${p.gostei ? "on" : ""}" aria-label="Gostar">♥<small>${p.likes}</small></button>` +
      `<button data-a="com" aria-label="Comentários">💬<small>${p.comentarios}</small></button>` +
      (p.tipo === "video" ? `<button data-a="som" aria-label="Som">${this.mudo ? "🔇" : "🔊"}</button>` : "") +
      `<button data-a="share" aria-label="Partilhar">➤</button>`;
  },
  contagens() {
    const s = document.querySelector("#stage .side");
    if (s) s.innerHTML = this.lado(this.lista[this.i]);
  },

  desenhar(dir) {
    const st = $("stage");
    st.innerHTML = "";
    const p = this.lista[this.i];
    if (!p) {
      const v = document.createElement("div");
      v.className = "vazio";
      v.textContent = "Ainda não há posts. Sê o primeiro, ninguém te vai fazer concorrência.";
      st.appendChild(v);
      return;
    }
    const c = document.createElement("article");
    c.className = "post" + (dir ? " ent-" + dir : "");
    c.style.setProperty("--h", p.hue);
    let m = null;
    if (p.tipo === "video") {
      m = document.createElement("video");
      m.src = "/media/" + p.ficheiro;
      m.autoplay = true; m.loop = true; m.muted = this.mudo; m.playsInline = true;
      m.onclick = () => (m.paused ? m.play() : m.pause());
    } else if (p.tipo === "imagem") {
      m = document.createElement("img");
      m.src = "/media/" + p.ficheiro;
      m.alt = p.texto || "Imagem do post";
    }
    if (m) { m.className = "media"; c.appendChild(m); }
    else { const t = document.createElement("div"); t.className = "txt"; t.textContent = p.texto; c.appendChild(t); }

    const info = document.createElement("div");
    info.className = "info";
    const autor = document.createElement("button");
    autor.className = "autor"; autor.dataset.a = "autor";
    autor.textContent = p.emoji + " " + p.user;
    info.appendChild(autor);
    if (m && p.texto) { const l = document.createElement("p"); l.textContent = p.texto; info.appendChild(l); }

    const side = document.createElement("div");
    side.className = "side"; side.innerHTML = this.lado(p);
    const pos = document.createElement("div");
    pos.className = "pos"; pos.textContent = (this.i + 1) + " / " + this.lista.length;
    c.append(info, side, pos);
    st.appendChild(c);
  },

  ir(d) {
    if (this.lista.length < 2) return;
    this.i = (this.i + d + this.lista.length) % this.lista.length;
    this.desenhar(d > 0 ? "l" : "r");
  },
  mostrar(id) {
    const k = this.lista.findIndex(p => p.id === id);
    if (k < 0) return;
    this.i = k;
    this.desenhar("");
  },
  async gostar(p) {
    try { const r = await API.post("/api/posts/" + p.id + "/like"); p.gostei = r.gostei; p.likes = r.likes; this.contagens(); }
    catch (e) { toast(e.message); }
  },
  ligar() {
    $("stage").onclick = e => {
      const b = e.target.closest("button");
      const p = this.lista[this.i];
      if (!b || !p) return;
      const a = b.dataset.a;
      if (a === "like") this.gostar(p);
      if (a === "com") Coment.abrir(p.id);
      if (a === "autor") Perfil.abrir(p.user);
      if (a === "share") toast(escolhe(TROLL.partilhar));
      if (a === "som") {
        this.mudo = !this.mudo;
        const v = document.querySelector("#stage video");
        if (v) v.muted = this.mudo;
        this.contagens();
      }
    };
  }
};

const Coment = {
  id: null,
  async abrir(id) { this.id = id; $("drawer").hidden = false; await this.desenhar(); $("ctexto").focus(); },
  fechar() { $("drawer").hidden = true; this.id = null; },
  async desenhar() {
    try {
      const l = await API.get("/api/posts/" + this.id + "/comentarios");
      const ul = $("clist");
      ul.innerHTML = "";
      if (!l.length) {
        const li = document.createElement("li");
        li.className = "sem"; li.textContent = "Sem comentários. Os outros 2 estão a ignorar-te.";
        ul.appendChild(li);
      }
      l.forEach(c => {
        const li = document.createElement("li"), b = document.createElement("b");
        b.textContent = c.emoji + " " + c.user + ": ";
        li.append(b, document.createTextNode(c.texto));
        ul.appendChild(li);
      });
    } catch (e) { toast(e.message); }
  },
  async enviar() {
    const t = $("ctexto").value.trim();
    if (!t) { toast("Comentário vazio. Que mistério profundo."); return; }
    try {
      await API.post("/api/posts/" + this.id + "/comentarios", { texto: t });
      $("ctexto").value = "";
      await this.desenhar();
      Feed.atualizar();
    } catch (e) { toast(e.message); }
  }
};
