fetch('dados.json')
  .then(res => res.json())
  .then(data => {

    const tabela = {};

    // =========================
    // PROCESSA RESULTADOS (GRUPOS)
    // =========================
    data.tabela_resultados.forEach(jogo => {

      if (jogo.fase !== "Grupos") return;
      if (jogo.gols_mandante === null || jogo.gols_visitante === null) return;

      // Garante que os times existem
      if (!tabela[jogo.mandante]) {
        tabela[jogo.mandante] = { pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0 };
      }
      if (!tabela[jogo.visitante]) {
        tabela[jogo.visitante] = { pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0 };
      }

      const mandante = tabela[jogo.mandante];
      const visitante = tabela[jogo.visitante];

      const gm = jogo.gols_mandante;
      const gv = jogo.gols_visitante;

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

    // =========================
    // CLASSIFICAÇÃO GERAL
    // =========================
    const corpo = document.querySelector('#classificacao tbody');
    corpo.innerHTML = "";

    Object.entries(tabela)
      .sort((a,b)=> 
        b[1].pts - a[1].pts ||
        (b[1].gp - b[1].gc) - (a[1].gp - a[1].gc) ||
        b[1].gp - a[1].gp
      )
      .forEach(([time,t])=>{
        corpo.innerHTML += `
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
          </tr>`;
      });

    // =========================
    // ARTILHARIA
    // =========================
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

    // =========================
    // TABELA DE JOGOS + MATA-MATA
    // =========================
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
