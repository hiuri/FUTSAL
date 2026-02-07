fetch('dados.json')
  .then(res => res.json())
  .then(data => {

    const tabela = {};

    // Inicializa times
    Object.values(data.grupos).flat().forEach(time => {
      tabela[time] = { pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0 };
    });

    // PROCESSA RESULTADOS
    data.tabela_resultados.forEach(jogo => {

      if (jogo.gols_mandante === null || jogo.gols_visitante === null) return;
      if (jogo.fase !== "Grupos") return;

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

    // CLASSIFICAÇÃO
    const corpo = document.querySelector('#classificacao tbody');
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

    // ARTILHARIA
    const art = document.querySelector('#artilharia tbody');
    data.tabela_artilharia
      .sort((a,b)=>b.gols - a.gols)
      .forEach(j=>{
        art.innerHTML += `
          <tr>
            <td>${j.jogador}</td>
            <td>${j.gols}</td>
          </tr>`;
      });

    // TABELA DE JOGOS + MATA-MATA
    const jogos = document.querySelector('#jogos tbody');
    const mata = document.querySelector('#mataMata tbody');

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

  });
