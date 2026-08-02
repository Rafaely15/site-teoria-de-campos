/* CAMPOSGRAV — dados globais e textos comuns a todas as páginas.
   ═══════════════════════════════════════════════════════════════════════
   ESTE É O ARQUIVO PARA EDITAR PRIMEIRO.
   Tudo aqui é PLACEHOLDER: troque pelos dados reais do grupo.
   Os textos específicos de cada página ficam no <script> ao final do
   respectivo arquivo .dc.html.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Fatos do grupo (iguais nos dois idiomas) ────────────────────────── */
window.CAMPOSGRAV_INFO = {
  email: 'ana.rafaely@academico.ufpb.br',
  addressLine1: 'Departamento de Física, CCEN — UFPB',
  addressLine2: 'Cidade Universitária, João Pessoa — PB, 58051-900',
  foundedYear: '2022',                       // ← TROCAR pelo ano de fundação
  copyrightYear: '2026',

  // Contadores exibidos nas estatísticas. Os membros são sincronizados pelo
  // build a partir das listas de Colaboradores.dc.html.
  // countPublications é só RESERVA: a home e a página de Publicações usam o
  // total real vindo do INSPIRE-HEP quando a busca funciona.
  countPublications: '293',
  countResearchers: '19',
  countProjects: '3',         // ← número de projetos listados em Projetos.dc.html
  countLines: '6',

  // Distribuição da equipe por nível.
  countProfessors: '3',
  countPostdocs: '2',
  countExternal: '4',
  countPhd: '4',
  countMasters: '3',
  countUndergrad: '3'
};

/* ── Textos comuns: cabeçalho, navegação e rodapé ────────────────────── */
window.CAMPOSGRAV_COMMON = {
  pt: {
    navHome: 'Início',
    navAbout: 'Sobre',
    navProjects: 'Projetos',
    navPubs: 'Publicações',
    navPeople: 'Colaboradores',
    navNews: 'Notícias',
    navContact: 'Contato',

    menuLabel: 'Abrir menu',
    langLabel: 'Idioma',

    descriptor: 'Núcleo de Teoria de Campos e Gravitação',
    affiliation: 'Departamento de Física · UFPB',
    university: 'Universidade Federal da Paraíba',
    tagline: 'Teoria de Campos e Gravitação',

    ftNav: 'Navegação',
    ftContact: 'Contato',
    ftRights: 'Todos os direitos reservados',
    supportTitle: 'Apoio',
    devCredit: 'Site desenvolvido por Ana Rafaely',

    ctaEyebrow: 'COLABORE COM O TQCG-UFPB',
    ctaTitle: 'Interessado em pesquisar com o grupo?',
    ctaLede: 'Estamos abertos a novos colaboradores, estudantes de iniciação científica e candidatos à pós-graduação.',
    ctaBtn: 'Fale conosco →'
  },

  en: {
    navHome: 'Home',
    navAbout: 'About',
    navProjects: 'Projects',
    navPubs: 'Publications',
    navPeople: 'People',
    navNews: 'News',
    navContact: 'Contact',

    menuLabel: 'Open menu',
    langLabel: 'Language',

    descriptor: 'Research Group on Field Theory and Gravitation',
    affiliation: 'Department of Physics · UFPB',
    university: 'Federal University of Paraíba',
    tagline: 'Field Theory and Gravitation',

    ftNav: 'Navigation',
    ftContact: 'Contact',
    ftRights: 'All rights reserved',
    supportTitle: 'Support',
    devCredit: 'Website developed by Ana Rafaely',

    ctaEyebrow: 'COLLABORATE WITH TQCG-UFPB',
    ctaTitle: 'Interested in doing research with us?',
    ctaLede: 'We welcome new collaborators, undergraduate research students and graduate applicants.',
    ctaBtn: 'Get in touch →'
  }
};

/* Junta os textos comuns, os fatos globais e o dicionário da página num só
   objeto — é o `t` usado nos templates ({{ t.navHome }}). */
window.CAMPOSGRAV_T = function (lang, pageDict) {
  var l = lang === 'en' ? 'en' : 'pt';
  var common = (window.CAMPOSGRAV_COMMON || {})[l] || {};
  var page = (pageDict || {})[l] || {};
  return Object.assign({}, window.CAMPOSGRAV_INFO || {}, common, page);
};

