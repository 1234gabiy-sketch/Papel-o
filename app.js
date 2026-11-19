const $ = id => document.getElementById(id);
const escolhe = lista => lista[Math.floor(Math.random() * lista.length)];

let _t;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("ver");
  clearTimeout(_t);
  _t = setTimeout(() => el.classList.remove("ver"), 2600);
}

function mostrarApp() {
  $("login").hidden = true;
  $("app").hidden = false;
  Feed.desenhar();
}

function arrancar() {
  Auth.desenhar();
  Feed.ligar();

  $("entrar").onclick = () => { if (Auth.entrar()) mostrarApp(); };
  $("pin").onkeydown = e => { if (e.key === "Enter") $("entrar").click(); };
  $("sair").onclick = () => { Auth.sair(); location.reload(); };

  $("fechar").onclick = () => Comments.fechar();
  $("cenviar").onclick = () => Comments.enviar();
  $("ctexto").onkeydown = e => { if (e.key === "Enter") Comments.enviar(); };

  $("novo").onclick = () => Upload.abrir();
  $("mfechar").onclick = () => Upload.fechar();
  $("mpostar").onclick = () => Upload.postar();

  if (Auth.user()) mostrarApp();
}

arrancar();
