// Servidor do Papelão: sem dependências, só Node.js
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, "data");
const UP = path.join(DATA, "uploads"), DBF = path.join(DATA, "db.json");
const MAX_USERS = 3, MAX_BYTES = 60 * 1024 * 1024, EMOJIS = ["🐸", "🦆", "🐙"];

fs.mkdirSync(UP, { recursive: true });
let db = { users: [], posts: [], sessions: {} };
try { db = JSON.parse(fs.readFileSync(DBF, "utf8")); } catch (e) {}
const save = () => fs.writeFileSync(DBF, JSON.stringify(db));

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".jpg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };
const EXT = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov", "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp" };

const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(ok => {
  let d = "";
  req.on("data", c => { d += c; if (d.length > 1e5) req.destroy(); });
  req.on("end", () => { try { ok(JSON.parse(d || "{}")); } catch (e) { ok({}); } });
});
const hash = (p, sal) => crypto.scryptSync(p, sal, 32).toString("hex");
const quem = req => db.users.find(u => u.nome === db.sessions[(req.headers.authorization || "").slice(7)]);
const emojiDe = nome => (db.users.find(u => u.nome === nome) || {}).emoji || "👤";
const pub = (p, me) => ({ id: p.id, user: p.user, emoji: emojiDe(p.user), texto: p.texto, hue: p.hue, tipo: p.tipo,
  ficheiro: p.ficheiro, likes: p.likes.length, gostei: !!me && p.likes.includes(me.nome), comentarios: p.comentarios.length });

function entrar(res, u) {
  const token = crypto.randomBytes(16).toString("hex");
  db.sessions[token] = u.nome; save();
  send(res, 200, { token, nome: u.nome, emoji: u.emoji });
}

async function api(req, res, p, m) {
  const me = quem(req);
  if (p === "/api/eu") return send(res, 200, { me: me ? { nome: me.nome, emoji: me.emoji } : null, vagas: MAX_USERS - db.users.length });

  if (p === "/api/registo" && m === "POST") {
    const b = await body(req), nome = String(b.nome || "").trim(), pass = String(b.pass || "");
    if (!/^[\w-]{2,16}$/.test(nome) || pass.length < 4) return send(res, 400, { erro: "Nome com 2 a 16 letras ou números e palavra-passe com pelo menos 4 caracteres, por favor." });
    if (db.users.length >= MAX_USERS) return send(res, 403, { erro: "Já há 3 pessoas aqui. A lista VIP está cheia." });
    if (db.users.some(u => u.nome.toLowerCase() === nome.toLowerCase())) return send(res, 409, { erro: "Esse nome já é de outra pessoa. Foi mais rápida." });
    const sal = crypto.randomBytes(8).toString("hex");
    const u = { nome, emoji: EMOJIS[db.users.length], sal, hash: hash(pass, sal) };
    db.users.push(u);
    return entrar(res, u);
  }
  if (p === "/api/login" && m === "POST") {
    const b = await body(req), u = db.users.find(x => x.nome.toLowerCase() === String(b.nome || "").toLowerCase());
    const ok = u && crypto.timingSafeEqual(Buffer.from(hash(String(b.pass || ""), u.sal)), Buffer.from(u.hash));
    return ok ? entrar(res, u) : send(res, 401, { erro: "Nome ou palavra-passe errados. Só há 3 pessoas e falhaste." });
  }
  if (!me) return send(res, 401, { erro: "Faz login primeiro." });

  if (p === "/api/upload" && m === "POST") {
    const tipoMime = String(req.headers["content-type"] || "").split(";")[0], ext = EXT[tipoMime];
    if (!ext) return send(res, 415, { erro: "Formato não aceite. Usa mp4, webm, mov, jpg, png, gif ou webp." });
    const nome = crypto.randomBytes(8).toString("hex") + ext, f = path.join(UP, nome);
    return new Promise(ok => {
      let n = 0, grande = false;
      const ws = fs.createWriteStream(f);
      req.on("data", c => {
        n += c.length;
        if (n > MAX_BYTES && !grande) {
          grande = true; req.unpipe(ws); ws.end(); fs.unlink(f, () => {});
          send(res, 413, { erro: "Ficheiro grande demais (máx. 60 MB)." }); ok();
        }
      });
      req.pipe(ws);
      ws.on("finish", () => {
        if (grande) return;
        send(res, 200, { ficheiro: nome, tipo: /mp4|webm|mov/.test(ext) ? "video" : "imagem" }); ok();
      });
    });
  }

  if (p === "/api/posts" && m === "GET") return send(res, 200, db.posts.map(x => pub(x, me)));
  if (p === "/api/posts" && m === "POST") {
    const b = await body(req), texto = String(b.texto || "").trim().slice(0, 140);
    let ficheiro = null, tipo = "texto";
    if (b.ficheiro) {
      if (!/^[a-f0-9]{16}\.\w+$/.test(b.ficheiro) || !fs.existsSync(path.join(UP, b.ficheiro))) return send(res, 400, { erro: "Ficheiro inválido." });
      ficheiro = b.ficheiro; tipo = /\.(mp4|webm|mov)$/.test(ficheiro) ? "video" : "imagem";
    }
    if (!texto && !ficheiro) return send(res, 400, { erro: "Post vazio." });
    const hue = Math.max(0, Math.min(360, +b.hue || 280));
    db.posts.unshift({ id: Date.now(), user: me.nome, texto, hue, tipo, ficheiro, likes: [], comentarios: [] });
    save();
    return send(res, 200, { ok: true });
  }

  const r = p.match(/^\/api\/posts\/(\d+)(?:\/(\w+))?$/);
  if (r) {
    const post = db.posts.find(x => x.id === +r[1]);
    if (!post) return send(res, 404, { erro: "Esse post já não existe." });
    if (!r[2] && m === "DELETE") {
      if (post.user !== me.nome) return send(res, 403, { erro: "Não é teu." });
      db.posts = db.posts.filter(x => x !== post);
      if (post.ficheiro) fs.unlink(path.join(UP, post.ficheiro), () => {});
      save(); return send(res, 200, { ok: true });
    }
    if (r[2] === "like" && m === "POST") {
      post.likes = post.likes.includes(me.nome) ? post.likes.filter(x => x !== me.nome) : [...post.likes, me.nome];
      save(); return send(res, 200, { gostei: post.likes.includes(me.nome), likes: post.likes.length });
    }
    if (r[2] === "comentarios" && m === "GET") return send(res, 200, post.comentarios.map(c => ({ user: c.user, emoji: emojiDe(c.user), texto: c.texto })));
    if (r[2] === "comentarios" && m === "POST") {
      const texto = String((await body(req)).texto || "").trim().slice(0, 200);
      if (!texto) return send(res, 400, { erro: "Comentário vazio." });
      post.comentarios.push({ user: me.nome, texto }); save();
      return send(res, 200, { ok: true });
    }
  }

  const pf = p.match(/^\/api\/perfil\/(.+)$/);
  if (pf && m === "GET") {
    const u = db.users.find(x => x.nome === decodeURIComponent(pf[1]));
    if (!u) return send(res, 404, { erro: "Essa pessoa não existe." });
    const posts = db.posts.filter(x => x.user === u.nome);
    return send(res, 200, { nome: u.nome, emoji: u.emoji, gostos: posts.reduce((s, x) => s + x.likes.length, 0), posts: posts.map(x => pub(x, me)) });
  }
  send(res, 404, { erro: "Não encontrado." });
}

// Ficheiros enviados, com suporte a Range (necessário para vídeo no telemóvel)
function media(req, res, p) {
  const f = path.join(UP, path.basename(p));
  fs.stat(f, (e, s) => {
    if (e) return send(res, 404, { erro: "Não existe." });
    const t = MIME[path.extname(f)] || "application/octet-stream";
    const r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
    if (r) {
      let a = r[1] ? +r[1] : 0, b = r[2] ? +r[2] : s.size - 1;
      if (!r[1] && r[2]) { a = Math.max(0, s.size - +r[2]); b = s.size - 1; }
      b = Math.min(b, s.size - 1);
      if (a > b) { res.writeHead(416, { "Content-Range": "bytes */" + s.size }); return res.end(); }
      res.writeHead(206, { "Content-Type": t, "Accept-Ranges": "bytes", "Content-Range": `bytes ${a}-${b}/${s.size}`, "Content-Length": b - a + 1 });
      fs.createReadStream(f, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { "Content-Type": t, "Accept-Ranges": "bytes", "Content-Length": s.size, "Cache-Control": "public, max-age=86400" });
      fs.createReadStream(f).pipe(res);
    }
  });
}

// Ficheiros do site, todos na mesma pasta que o server.js (só estes são servidos)
const SITE = ["index.html", "style.css", "logo.svg", "api.js", "auth.js", "feed.js", "profile.js", "upload.js", "app.js"];
function estatico(res, p) {
  const nome = p === "/" ? "index.html" : p.slice(1);
  if (!SITE.includes(nome)) { res.writeHead(404); return res.end("Não encontrado"); }
  fs.readFile(path.join(__dirname, nome), (e, d) => {
    if (e) { res.writeHead(404); return res.end("Não encontrado"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(nome)] || "application/octet-stream" });
    res.end(d);
  });
}

http.createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  try {
    if (p.startsWith("/api/")) return await api(req, res, p, req.method);
    if (p.startsWith("/media/")) return media(req, res, p);
    estatico(res, p);
  } catch (e) { console.error(e); if (!res.headersSent) send(res, 500, { erro: "Erro no servidor." }); }
}).listen(PORT, () => console.log("Papelão a correr na porta " + PORT));
