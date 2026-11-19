const Feed = {
  posts: DB.load("posts", null) || SEED.map(p => ({ ...p })),
  guardar() { DB.save("posts", this.posts.map(({ video, ...resto }) => resto)); },
  desenhar() {
    const el = document.getElementById("feed");
    const topo = el.scrollTop;
    const eu = Auth.user();
    el.innerHTML = "";
    this.posts.forEach(p => {
      const u = USERS.find(x => x.id === p.user);
      const c = document.createElement("article");
      c.className = "post";
      c.dataset.id = p.id;
      c.style.setProperty("--h", p.hue);
      if (p.video) {
        const v = document.createElement("video");
        v.src = p.video; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
        c.appendChild(v);
      }
      const t = document.createElement("div");
      t.className = "txt"; t.textContent = p.texto;
      const info = document.createElement("div");
      info.className = "info";
      const nome = document.createElement("b");
      nome.textContent = u.emoji + " " + u.nome;
      info.appendChild(nome);
      const gosto = p.likes.includes(eu.id);
      const side = document.createElement("div");
      side.className = "side";
      side.innerHTML =
        `<button data-a="like" class="${gosto ? "on" : ""}" aria-label="Gostar">♥<small>${p.likes.length}</small></button>` +
        `<button data-a="com" aria-label="Comentários">💬<small>${p.comentarios.length}</small></button>` +
        `<button data-a="share" aria-label="Partilhar">➤</button>`;
      c.append(t, info, side);
      el.appendChild(c);
    });
    el.scrollTop = topo;
  },
  gostar(id) {
    const p = this.posts.find(x => x.id === id), eu = Auth.user().id;
    p.likes = p.likes.includes(eu) ? p.likes.filter(x => x !== eu) : [...p.likes, eu];
    this.guardar();
    this.desenhar();
  },
  ligar() {
    const el = document.getElementById("feed");
    el.onclick = e => {
      const b = e.target.closest("button[data-a]");
      if (!b) return;
      const id = +b.closest(".post").dataset.id;
      if (b.dataset.a === "like") this.gostar(id);
      if (b.dataset.a === "com") Comments.abrir(id);
      if (b.dataset.a === "share") toast(escolhe(TROLL.partilhar));
    };
    el.ondblclick = e => {
      const post = e.target.closest(".post");
      if (post && !e.target.closest("button")) this.gostar(+post.dataset.id);
    };
  }
};
