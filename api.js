// Fala com o servidor
const API = {
  token: localStorage.getItem("pp_token") || "",
  async chamar(metodo, url, corpo) {
    const h = {};
    if (this.token) h.Authorization = "Bearer " + this.token;
    let b;
    if (corpo !== undefined) { h["Content-Type"] = "application/json"; b = JSON.stringify(corpo); }
    let r;
    try { r = await fetch(url, { method: metodo, headers: h, body: b }); }
    catch (e) { throw new Error("Sem ligação ao servidor. Se o Render estava a dormir, espera 1 minuto e tenta de novo."); }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && this.token && url !== "/api/login") { this.guardar(""); location.reload(); }
    if (!r.ok) throw new Error(j.erro || "Algo correu mal (código " + r.status + ").");
    return j;
  },
  get(url) { return this.chamar("GET", url); },
  post(url, corpo) { return this.chamar("POST", url, corpo || {}); },
  apagar(url) { return this.chamar("DELETE", url); },
  async enviar(ficheiro) {
    let r;
    try { r = await fetch("/api/upload", { method: "POST", headers: { Authorization: "Bearer " + this.token, "Content-Type": ficheiro.type }, body: ficheiro }); }
    catch (e) { throw new Error("A ligação caiu durante o envio. Tenta com um ficheiro mais pequeno."); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || "Falhou o envio do ficheiro (código " + r.status + ").");
    return j;
  },
  guardar(t) { this.token = t; localStorage.setItem("pp_token", t); }
};
