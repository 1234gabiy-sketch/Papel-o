const Upload = {
  abrir() { document.getElementById("modal").hidden = false; document.getElementById("mtexto").focus(); },
  fechar() {
    document.getElementById("modal").hidden = true;
    document.getElementById("mtexto").value = "";
    document.getElementById("mvideo").value = "";
  },
  postar() {
    const texto = document.getElementById("mtexto").value.trim();
    if (!texto) { toast(escolhe(TROLL.semTexto)); return; }
    const ficheiro = document.getElementById("mvideo").files[0];
    const novo = {
      id: Date.now(),
      user: Auth.user().id,
      texto,
      hue: +document.getElementById("mhue").value,
      likes: [],
      comentarios: []
    };
    if (ficheiro) novo.video = URL.createObjectURL(ficheiro);
    Feed.posts.unshift(novo);
    Feed.guardar();
    this.fechar();
    Feed.desenhar();
    document.getElementById("feed").scrollTop = 0;
    toast(escolhe(TROLL.postou));
  }
};
