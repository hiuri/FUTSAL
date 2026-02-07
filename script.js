fetch('dados.json')
  .then(res => res.json())
  .then(data => {

    const tabela = {};
    const artilharia = {};
    const cartoes = {};

    data.times.forEach(time => {
      tabela[time] = { pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0 };
    });

    data.jogos.forEach(jogo => {

      const gm = jogo.golsMandante.reduce((s,g)=>s+g.quantidade,0);
      const gv = jogo.golsVisitante.reduce((s,g)=>s+g.quantidade,0);

      if (jogo.fase === "Grupos") {
        tabela[jogo.mandante].j++;
        tabela[jogo.visitante].j++;
        tabela[jogo.mandante].gp += gm;
        tabela[jogo.mandante].gc += gv;
        tabela[jogo.visitante].gp += gv;
        tabela[jogo.visitante].gc += gm;

        if (gm > gv) {
          tabela[jogo.mandante].v++;
          tabela[jogo.mandante].pts += 3;
          tabela[jogo.visitante].d++;
        } else if (gv > gm) {
          tabela[jogo.visitante].v++;
          tabela[jogo.visitante].pts += 3;
          tabela[jogo.mandante].d++;
        } else {
          tabela[jogo.mandante].e++;
          tabela[jogo.visitante].e++;
          tabela[jogo.mandante].pts++;
          tabela[jogo.visitante].pts++;
        }
      }

      [...jogo.golsMandante, ...jogo.golsVisitante].forEach(g => {
        artilharia[g.jogador] = (artilharia[g.jogador] || 0) + g.quantidade;
      });

      jogo.cartoes.forEach(c => {
        if (!cartoes[c.jogador]) {
          cartoes[c.jogador] = { time:c.time, amarelo:0, vermelho:0 };
        }
        cartoes[c.jogador].amarelo += c.amarelo;
        cartoes[c.jogador].vermelho += c.vermelho;
      });
    });

    // CLASSIFICAÇÃO
    const corpo = document.querySelector('#classificacao tbody');
    Object.entries(tabela)
      .sort((a,b)=>b[1].pts - a[1].pts || (b[1].gp-b[1].gc)-(a[1].gp-a[1].gc))
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
    Object.entries(artilharia)
      .sort((a,b)=>b[1]-a[1])
      .forEach(([j,g])=>{
        art.innerHTML += `<tr><td>${j}</td><td>${g}</td></tr>`;
      });

    // CARTÕES
    const car = document.querySelector('#cartoes tbody');
    Object.entries(cartoes).forEach(([j,c])=>{
      car.innerHTML += `
        <tr>
          <td>${j}</td>
          <td>${c.time}</td>
          <td>${c.amarelo}</td>
          <td>${c.vermelho}</td>
        </tr>`;
    });

    // JOGOS
    const jogos = document.querySelector('#jogos tbody');
    const mata = document.querySelector('#mataMata tbody');

    data.jogos.forEach(j=>{
      const gm = j.golsMandante.reduce((s,g)=>s+g.quantidade,0);
      const gv = j.golsVisitante.reduce((s,g)=>s+g.quantidade,0);
      const placar = (gm+gv>0) ? `${gm} x ${gv}` : "x";

      const linha = `
        <tr>
          <td>${j.dia}</td>
          <td>${j.hora}</td>
          <td>${j.mandante}</td>
          <td>${placar}</td>
          <td>${j.visitante}</td>
          <td>${j.fase}</td>
        </tr>`;

      if (j.fase === "Grupos") jogos.innerHTML += linha;
      else mata.innerHTML += `
        <tr>
          <td>${j.fase}</td>
          <td>${j.mandante}</td>
          <td>${placar}</td>
          <td>${j.visitante}</td>
        </tr>`;
    });

  });
