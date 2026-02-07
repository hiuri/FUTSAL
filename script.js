fetch('dados.json')
  .then(res => {
    if (!res.ok) throw new Error("Erro ao carregar JSON");
    return res.json();
  })
  .then(data => {

    /* =========================
       CLASSIFICAÇÃO POR GRUPO
    ========================= */

    const container = document.querySelector('#classificacaoGrupos');
    container.innerHTML = "";

    Object.entries(data.grupos).forEach(([nomeGrupo, timesGrupo]) => {

      const tabela = {};

      // inicializa times do grupo
      timesGrupo.forEach(time => {
        tabela[time] = { pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0 };
      });

      // processa jogos do grupo
      data.tabela_resultados.forEach(jogo => {

        if (jogo.fase !== "Grupos") return;
        if (!tabela[jogo.mandante] || !tabela[jogo.visitante]) return;
        if (jogo.gols_mandante === null || jogo.gols_visitante === null) return;

        const gm = jogo.gols_mandante;
        const gv = jogo.gols_visitante;

        const mandante = tabela[jogo.mandante];
        const visitante = tabela[jogo.visitante];

        mandante.j++;
        visitante.j++;

        mandante.gp += gm;
        mandante.gc += gv;
        visitante.gp += gv;
        visitante.gc += gm;

        if (gm > gv) {
          mandante.v++;
          mandante.pts += 3;
          visitante.d++;
        } else if (gv > gm) {
          visitante.v++;
          visitante.pts += 3;
          mandante.d++;
        } else {
          mandante.e++;
          visitante.e++;
          mandante.pts++;
          visitante.pts++;
        }
      });

      // ordenação
      const classificados = Object.entries(tabela).sort((a,b)=>
        b[1].pts - a[1].pts ||
        (b[1].gp - b[1].gc) - (a[1].gp - a[1].gc) ||
        b[1].gp - a[1].gp
      );

      // monta tabela HTML do grupo
      let html = `
        <h2 class="mt-5">${nomeGrupo}</h2>
        <table class="table table-bordered">
          <thead class="table-dark">
            <tr>
              <th>Time</th>
              <th>Pts</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
            </tr>
          </thead>
          <tbody>
      `;

      classificados.forEach(([time,t])=>{
        html += `
          <tr>
            <td>${time}</td>
            <td>${t.pts}</td>
            <td>${t.j}</td>
            <td>${t.v}</td>
            <td>${t.e}</td>
            <td>${t.d}</td>
            <td>${t.gp}</td>
            <td>${t.gc}</td>
            <td>${t.gp - t.gc}</td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML += html;

    });

    /* =========================
       ARTILHARIA
    ========================= */

    const art = document.querySelector('#artilharia tbody');
    art.innerHTML = "";

    data.tabela_artilharia
      .sort((a,b)=>b.gols - a.gols)
      .forEach(j=>{
        art.innerHTML += `
          <tr>
            <td>${j.jogador}</td>
            <td>${j.gols}</td>
          </tr>`;
      });

    /* =========================
       TABELA DE JOGOS + MATA-MATA
    ========================= */

    const jogos = document.querySelector('#jogos tbody');
    const mata = document.querySelector('#mataMata tbody');

    jogos.innerHTML = "";
    mata.innerHTML = "";

    data.tabela_resultados.forEach(j=>{
      const placar = (j.gols_mandante !== null)
        ? `${j.gols_mandante} x ${j.gols_visitante}`
        : "x";

      if (j.fase === "Grupos") {
        jogos.innerHTML += `
          <tr>
            <td>${j.dia}</td>
            <td>${j.hora}</td>
            <td>${j.mandante}</td>
            <td>${placar}</td>
            <td>${j.visitante}</td>
            <td>${j.fase}</td>
          </tr>`;
      } else {
        mata.innerHTML += `
          <tr>
            <td>${j.fase}</td>
            <td>${j.mandante}</td>
            <td>${placar}</td>
            <td>${j.visitante}</td>
          </tr>`;
      }
    });

  })
  .catch(err => console.error("Erro ao carregar dados:", err));
