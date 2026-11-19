const Perfil = {
  async abrir(nome) {
    try {
      const r = await API.get("/api/perfil/" + encodeURIComponent(nome));
      const meu = r.nome === Auth.me.nome;
      $("pnome").textContent = r.emoji + " " + r.nome;
      $("pstats").textContent = r.posts.length + " posts, " + r.gostos + " gostos";
      $("sair").hidden = !meu;
      const g = $("grelha");
      g.innerHTML = "";
      if (!r.posts.length) { g.textContent = "Sem posts. Mistério."; }
      r.posts.forEach(p => {
        const t = document.createElement("div");
        t.className = "tile"; t.style.setProperty("--h", p.hue);
        if (p.tipo === "imagem") {
          const im = document.createElement("img"); im.src = "/media/" + p.ficheiro; im.alt = ""; t.appendChild(im);
        } else if (p.tipo === "video") {
          const v = document.createElement("video"); v.src = "/media/" + p.ficheiro + "#t=0.1"; v.muted = true; v.preload = "metadata"; v.playsInline = true; t.appendChild(v);
        } else { t.appendChild(document.createTextNode(p.texto)); }
        const ab = document.createElement("button");
        ab.className = "abrir"; ab.setAttribute("aria-label", "Ver post");
        ab.onclick = () => { this.fechar(); Feed.mostrar(p.id); };
        t.appendChild(ab);
        if (meu) {
          const ap = document.createElement("button");
          ap.className = "apagar"; ap.textContent = "✕"; ap.setAttribute("aria-label", "Apagar post");
          ap.onclick = async () => {
            if (!confirm("Apagar este post?")) return;
            try { await API.apagar("/api/posts/" + p.id); await Feed.atualizar(); this.abrir(nome); } catch (e) { toast(e.message); }
          };
          t.appendChild(ap);
        }
        g.appendChild(t);
      });
      $("perfil").classList.add("aberto");
    } catch (e) { toast(e.message); }
  },
  fechar() { $("perfil").classList.remove("aberto"); }
};
