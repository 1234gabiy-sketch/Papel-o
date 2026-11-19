// Guarda tudo no localStorage deste navegador (cada pessoa tem os seus dados locais)
const DB = {
  load(chave, padrao) {
    try {
      const v = localStorage.getItem("pp_" + chave);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) { return padrao; }
  },
  save(chave, valor) {
    try { localStorage.setItem("pp_" + chave, JSON.stringify(valor)); } catch (e) {}
  }
};
