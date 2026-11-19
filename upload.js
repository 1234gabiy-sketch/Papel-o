const Upload = {
  abrir() { $("modal").hidden = false; $("mtexto").focus(); },
  fechar() { $("modal").hidden = true; $("mtexto").value = ""; $("mficheiro").value = ""; },
  async postar() {
    const texto = $("mtexto").value.trim(), f = $("mficheiro").files[0];
    if (!texto && !f) { toast(escolhe(TROLL.semTexto)); return; }
    if (f && f.size > 60 * 1024 * 1024) { toast("Esse ficheiro é enorme. Máximo 60 MB."); return; }
    const b = $("mpostar");
    b.disabled = true; b.textContent = "A enviar...";
    let passo = "No envio do ficheiro";
    try {
      const ficheiro = f ? (await API.enviar(f)).ficheiro : null;
      passo = "Ao publicar";
      await API.post("/api/posts", { texto, ficheiro, hue: +$("mhue").value });
      this.fechar();
      await Feed.carregar();
      Feed.i = 0;
      Feed.desenhar("");
      toast(escolhe(TROLL.postou));
    } catch (e) { toast(passo + ": " + e.message); }
    b.disabled = false; b.textContent = "Publicar";
  }
};
