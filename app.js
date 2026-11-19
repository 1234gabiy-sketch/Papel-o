const $ = id => document.getElementById(id);
const escolhe = l => l[Math.floor(Math.random() * l.length)];

let _t;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("ver");
  clearTimeout(_t);
  _t = setTimeout(() => el.classList.remove("ver"), 3000);
}

const TROLL = {
  partilhar: ["Partilhar com quem? Já está toda a gente aqui.", "Link copiado para o vazio."],
  semTexto: ["Escreve alguma coisa ou escolhe um ficheiro. Post em branco não conta."],
  postou: ["Publicado! Alcance estimado: 2 pessoas.", "No ar. Vais ter 100% de audiência."]
};

const aberto = () => !$("drawer").hidden || !$("modal").hidden || $("perfil").classList.contains("aberto");

async function mostrarApp() {
  $("login").hidden = true;
  $("app").hidden = false;
  await Feed.iniciar();
  toast("Desliza para a direita: outro post. Para baixo: perfil.");
}

function ligar() {
  Feed.ligar();
  $("entrar").onclick = async () => { if (await Auth.enviar()) mostrarApp(); };
  $("pass").onkeydown = e => { if (e.key === "Enter") $("entrar").click(); };
  $("aba").onclick = () => Auth.aba(!Auth.registo);
  $("sair").onclick = () => Auth.sair();
  $("meu").onclick = () => Perfil.abrir(Auth.me.nome);
  $("pfechar").onclick = () => Perfil.fechar();
  $("fechar").onclick = () => Coment.fechar();
  $("cenviar").onclick = () => Coment.enviar();
  $("ctexto").onkeydown = e => { if (e.key === "Enter") Coment.enviar(); };
  $("novo").onclick = () => Upload.abrir();
  $("mfechar").onclick = () => Upload.fechar();
  $("mpostar").onclick = () => Upload.postar();

  // Gestos: direita = seguinte, esquerda = anterior, baixo = perfil
  let x0 = null, y0 = 0;
  const st = $("stage");
  st.addEventListener("pointerdown", e => { if (e.target.closest("button")) { x0 = null; return; } x0 = e.clientX; y0 = e.clientY; });
  st.addEventListener("pointerup", e => {
    if (x0 === null || aberto()) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) Feed.ir(dx > 0 ? 1 : -1);
    else if (dy > 80 && dy > Math.abs(dx)) Perfil.abrir(Auth.me.nome);
  });
  st.addEventListener("pointercancel", () => { x0 = null; });

  // Teclado (Chromebook): setas
  document.addEventListener("keydown", e => {
    if (!Auth.me || ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "Escape" || e.key === "ArrowUp") { Coment.fechar(); Upload.fechar(); Perfil.fechar(); return; }
    if (aberto()) return;
    if (e.key === "ArrowRight") Feed.ir(1);
    if (e.key === "ArrowLeft") Feed.ir(-1);
    if (e.key === "ArrowDown") Perfil.abrir(Auth.me.nome);
  });

  // Vai buscar posts novos dos outros de vez em quando
  setInterval(() => { if (Auth.me && !document.hidden && !aberto()) Feed.atualizar().catch(() => {}); }, 15000);
}

async function arrancar() {
  ligar();
  Auth.aba(false);
  if (await Auth.init()) mostrarApp();
}
arrancar();
