/* QCAMPO — busca automática de publicações no INSPIRE-HEP.
   ═══════════════════════════════════════════════════════════════════════
   O INSPIRE-HEP (inspirehep.net) é a base de referência de física de altas
   energias e gravitação — cobre gr-qc e hep-th, incluindo preprints do arXiv.
   A API dele libera acesso direto do navegador, então a página de Publicações
   busca os dados na hora, sem servidor nenhum.

   ───────────────────────────────────────────────────────────────────────
   COMO LIGAR (2 passos)
   ───────────────────────────────────────────────────────────────────────
   1) Descubra o identificador INSPIRE de cada pesquisador:
      abra https://inspirehep.net, busque o nome da pessoa, entre no perfil
      dela e olhe o endereço. Vai ser algo como
          https://inspirehep.net/authors/1234567
      e no topo da página aparece o "BAI", no formato  J.Silva.1

   2) Preencha `query` abaixo com os autores separados por ` or ` e mude
      `enabled` para true. Exemplos:

        query: 'a J.Silva.1'                        // um autor
        query: 'a J.Silva.1 or a M.Souza.2'         // vários autores
        query: 'a J.Silva.1 and de 2015->2026'      // recorte por ano
        query: 'orcid 0000-0002-1234-5678'          // por ORCID

   Enquanto `enabled` for false, a página usa a lista escrita à mão dentro de
   Publicacoes.dc.html. Se a busca falhar (rede fora, INSPIRE fora do ar), a
   página também cai nessa lista e avisa discretamente — nunca fica vazia.
   ═══════════════════════════════════════════════════════════════════════ */

window.QCAMPO_INSPIRE = {

  /* ← MUDE PARA true DEPOIS DE PREENCHER A QUERY ABAIXO */
  enabled: true,

  /* Autores do grupo. Cada `a X.Y.1` é o identificador INSPIRE (BAI) de uma
     pessoa; junte novos membros com ` or `.

       a P.J.Porfirio.1      Paulo J. Porfirio       inspirehep.net/authors/1812042
       a Albert.Petrov.1     Albert Yu. Petrov       inspirehep.net/authors/993565
       a J.R.Nascimento.1    J.R.S. Nascimento       inspirehep.net/authors/996040
       a R.A.A.M.Oliveira.1  Ana Rafaely M. Oliveira inspirehep.net/authors/2530839 */
  query: 'a P.J.Porfirio.1 or a Albert.Petrov.1 or a J.R.Nascimento.1 or a R.A.A.M.Oliveira.1',

  /* Quantas publicações no máximo trazer (o INSPIRE aceita até 1000).
     Hoje a busca acima devolve ~294 — deixamos folga para o grupo crescer. */
  max: 600,

  /* Descarta registros anteriores a este ano.
     MOTIVO: o perfil INSPIRE da Ana Rafaely (recid 2530839) tem anexado, por
     homonímia, o artigo de física nuclear "Angular Correlation Measurement in
     Kr-80" (1988) — de outro R.A.A.M. Oliveira. O trabalho mais antigo de
     verdade do grupo é de 1992 (J.R.S. Nascimento), então cortar antes de 1990
     remove o intruso sem perder nada legítimo.
     A CORREÇÃO DEFINITIVA é no INSPIRE: entrar em inspirehep.net com a conta
     do ORCID, abrir o próprio perfil e pedir a remoção do artigo errado.
     Depois disso, pode baixar este valor para 0. */
  anoMinimo: 1990,

  /* Quantos autores listar antes de cortar com "et al." */
  maxAutores: 6,

  endpoint: 'https://inspirehep.net/api/literature',

  /* Monta a busca final. O corte por ano entra AQUI, na própria consulta, e
     não depois: assim o total devolvido pelo INSPIRE já vem certo e o número
     da home bate com o da página de Publicações.
     Os parênteses são obrigatórios — sem eles o `and` gruda só no último
     autor da lista e o resultado sai errado (292 em vez de 293). */
  queryEfetiva: function () {
    if (!this.anoMinimo) return this.query;
    return '(' + this.query + ') and date >= ' + this.anoMinimo;
  },

  /* Busca e devolve uma Promise com a lista já normalizada no formato que a
     página usa: { year, title, authors, venue, doi, doiUrl }. */
  buscar: function () {
    var self = this;
    var url = this.endpoint
      + '?q=' + encodeURIComponent(this.queryEfetiva())
      + '&sort=mostrecent'
      + '&size=' + this.max
      + '&fields=titles,authors,publication_info,arxiv_eprints,dois,earliest_date';

    /* Sem timeout, uma rede lenta deixaria a página "carregando" para sempre. */
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);

    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('INSPIRE respondeu ' + r.status);
        return r.json();
      })
      .then(function (json) {
        if (timer) clearTimeout(timer);
        var hits = (json && json.hits && json.hits.hits) || [];
        return hits.map(function (h) { return self.normalizar(h.metadata || {}); })
                   .filter(function (p) { return p.title; });
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  },

  /* Versão leve para a página inicial: pede só os `n` mais recentes e lê o
     total do próprio cabeçalho da resposta — não vale baixar 300 registros
     para mostrar 3. Devolve { total, recentes }. */
  buscarResumo: function (n) {
    var self = this;
    var url = this.endpoint
      + '?q=' + encodeURIComponent(this.queryEfetiva())
      + '&sort=mostrecent'
      + '&size=' + (n || 3)
      + '&fields=titles,authors,publication_info,arxiv_eprints,dois,earliest_date';

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);

    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('INSPIRE respondeu ' + r.status);
        return r.json();
      })
      .then(function (json) {
        if (timer) clearTimeout(timer);
        var hits = (json && json.hits && json.hits.hits) || [];
        return {
          total: (json && json.hits && json.hits.total) || 0,
          recentes: hits.map(function (h) { return self.normalizar(h.metadata || {}); })
        };
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  },

  /* Converte um registro do INSPIRE no formato usado pelos cards da página. */
  normalizar: function (m) {
    var titulo = (m.titles && m.titles[0] && m.titles[0].title) || '';
    var ano = (m.earliest_date || '').slice(0, 4);

    /* O INSPIRE devolve "Sobrenome, Nome"; viramos para a ordem natural. */
    var autores = (m.authors || []).map(function (a) {
      var nome = a.full_name || '';
      var i = nome.indexOf(',');
      return i === -1 ? nome : (nome.slice(i + 1).trim() + ' ' + nome.slice(0, i).trim());
    });
    var listaAutores = autores.length > this.maxAutores
      ? autores.slice(0, this.maxAutores).join(', ') + ' et al.'
      : autores.join(', ');

    /* Periódico quando publicado; senão, a seção do arXiv. */
    var pi = (m.publication_info || [])[0] || {};
    var eprint = (m.arxiv_eprints || [])[0];
    var venue;
    if (pi.journal_title) {
      venue = pi.journal_title + (pi.journal_volume ? ' ' + pi.journal_volume : '');
    } else if (eprint) {
      venue = 'arXiv · ' + ((eprint.categories && eprint.categories[0]) || 'preprint');
    } else {
      venue = 'Preprint';
    }

    /* Link: DOI quando existe, senão a página do preprint no arXiv. */
    var doiVal = (m.dois && m.dois[0] && m.dois[0].value) || null;
    var rotulo, link;
    if (doiVal) {
      rotulo = doiVal;
      link = 'https://doi.org/' + doiVal;
    } else if (eprint) {
      rotulo = 'arXiv:' + eprint.value;
      link = 'https://arxiv.org/abs/' + eprint.value;
    } else {
      rotulo = 'INSPIRE';
      link = 'https://inspirehep.net/search?q=' + encodeURIComponent(titulo);
    }

    return {
      year: ano,
      title: titulo,
      authors: listaAutores,
      venue: venue,
      doi: rotulo,
      doiUrl: link
    };
  }
};
