// Edita aqui os nomes das 3 pessoas e o PIN
const USERS = [
  { id: 1, nome: "Pessoa 1", emoji: "🐸" },
  { id: 2, nome: "Pessoa 2", emoji: "🦆" },
  { id: 3, nome: "Pessoa 3", emoji: "🐙" }
];
const PIN = "1234";

const SEED = [
  { id: 1, user: 1, texto: "Bem-vindos ao Papelão. Somos 3. É um recorde de intimidade.", hue: 280, likes: [], comentarios: [] },
  { id: 2, user: 2, texto: "Este vídeo teve 2 visualizações. Uma foi minha.", hue: 150, likes: [], comentarios: [] },
  { id: 3, user: 3, texto: "Algoritmo de recomendação: mostra tudo, há 3 posts.", hue: 20, likes: [], comentarios: [] }
];

const TROLL = {
  pinErrado: ["PIN errado. Só há 3 pessoas e ainda assim falhaste.", "Quase! Era 1234. Ups, spoiler."],
  semPerfil: ["Escolhe quem és. Tens 3 opções, vais conseguir."],
  partilhar: ["Partilhar com quem? Já está toda a gente aqui.", "Link copiado para o vazio."],
  semTexto: ["Escreve alguma coisa, não é um post em branco."],
  postou: ["Publicado! Alcance estimado: 2 pessoas.", "Post no ar. Vais ter 100% de audiência."]
};
