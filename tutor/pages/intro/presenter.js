// 紹介スライドの「講師紹介」ページの内容です。講師が変わるときは、このファイルだけを書き換えてください（ビルドは不要）。
// このページが表示されるのは、スライドを deck.html?present で開いたときだけです（参加者が自分で読むときには出ません）。
// window.PRESENTER を空（null）にするか name を消すと、?present でも表示されません。
// photo には、このフォルダからの相対パス（例: "assets/presenter.jpg"）を指定できます。空ならイニシャルを表示します。
window.PRESENTER = {
  name: "Mao Kano",
  role: "Applied AI Architect",
  org: "Anthropic Japan",
  photo: "",
  career: [
    { years: "2026〜", org: "Anthropic Japan", role: "Applied AI Architect" },
    { years: "2020〜2026", org: "Google Cloud Japan", role: "Customer Engineer" },
    { years: "2018〜2020", org: "Cisco Systems", role: "Presales Engineer & Professional Service Consultant" },
    { years: "2015〜2018", org: "MetLife Japan", role: "Lead Solution Architect" },
    { years: "2010〜2015", org: "Works Applications Ltd.", role: "Platform Development Engineer, Manager" },
  ],
};
