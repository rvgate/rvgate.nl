/*
 * ================================================================
 *  ALL CONTENT OF THE SITE LIVES IN THIS FILE.
 *  Edit the text below; the components take care of the layout.
 * ================================================================
 *
 *  Languages: any text can be written as
 *      { en: 'English text', nl: 'Nederlandse tekst' }
 *  or as a plain string when it's the same in every language
 *  (names, URLs, technologies). A missing translation falls back
 *  to English. Languages themselves are configured in `languages`.
 *
 *  Colours: wherever a `color` or `accent` is asked for, use one of
 *    'blue' | 'teal' | 'orange' | 'purple' | 'pink' | 'green'
 *  (they adapt automatically to dark and light mode).
 *
 *  Icons: wherever an `icon` is asked for, use one of
 *    'mail' | 'phone' | 'linkedin' | 'github' | 'location' | 'globe'
 *    'briefcase' | 'bolt' | 'code' | 'cloud' | 'question' | 'people'
 *    'link' | 'graduation' | 'certificate' | 'chat' | 'heart' | 'pulse'
 *    'server' | 'monitor' | 'terminal' | 'dice' | 'motorcycle' | 'plane'
 *    'coffee' | 'gamepad' | 'utensils' | 'music' | 'ball' | 'moon' | 'sun'
 *    'sparkles'
 *  (add more in src/components/BaseIcon.vue).
 *
 *  Dates: write them as 'YYYY-MM'. Use `to: null` for "Present".
 *  Month names and durations ("3 yrs 2 mos") are generated for you,
 *  in the language of the page.
 */

export default {
  // ------------------------------------------------------------
  //  Languages (first one is the fallback)
  //  locale is used for month names: 'en-GB' → "Mar 2022", 'nl-NL' → "mrt 2022"
  // ------------------------------------------------------------
  languages: {
    en: { label: 'EN', name: 'English', locale: 'en-GB' },
    nl: { label: 'NL', name: 'Nederlands', locale: 'nl-NL' },
  },

  // Browser tab title and search-engine description
  meta: {
    title: 'Rvgate Development',
    description: {
      en: 'Online CV of René van Aerle: skills, work experience, projects, services and contact details.',
      nl: 'Online cv van René van Aerle: skills, werkervaring, projecten, diensten en contactgegevens.',
    },
  },

  labels: {
    present: { en: 'Present', nl: 'Heden' },
    year: { en: ['yr', 'yrs'], nl: ['jr', 'jr'] },     // singular, plural
    month: { en: ['mo', 'mos'], nl: ['mnd', 'mnd'] },
  },

  // Small interface texts. {n}, {skill} are filled in automatically;
  // a [singular, plural] pair is picked based on {n}.
  ui: {
    skillsHint: {
      en: 'Click a skill to highlight where I used it.',
      nl: 'Klik op een skill om te zien waar ik die heb ingezet.',
    },
    // "used in 3 roles and 1 project." is built from these pieces
    usedIn: { en: 'used in', nl: 'gebruikt in' },
    roles: { en: ['{n} role', '{n} roles'], nl: ['{n} rol', '{n} rollen'] },
    projectsCount: { en: ['{n} project', '{n} projects'], nl: ['{n} project', '{n} projecten'] },
    and: { en: 'and', nl: 'en' },
    noMatches: {
      en: 'not tagged in any role or project yet.',
      nl: 'nog niet getagd bij een rol of project.',
    },
    show: { en: 'Show ↓', nl: 'Bekijk ↓' },
    clear: { en: 'Clear', nl: 'Wissen' },
    showOlder: { en: 'Go further into the past', nl: 'Verder terug in de tijd' },
    hideOlder: { en: 'Back to the present', nl: 'Terug naar het heden' },
    highlighting: { en: 'Highlighting', nl: 'Gemarkeerd:' },
    clearHighlight: { en: 'Clear skill highlight', nl: 'Markering wissen' },
    highlightSkill: { en: 'Highlight where I used {skill}', nl: 'Toon waar ik {skill} heb gebruikt' },
    skillCategories: { en: 'Skill categories', nl: 'Skillcategorieën' },
    viewProject: { en: 'View project', nl: 'Bekijk project' },
    toLight: { en: 'Switch to light mode', nl: 'Schakel naar lichte modus' },
    toDark: { en: 'Switch to dark mode', nl: 'Schakel naar donkere modus' },
    themeTitle: { en: 'Toggle dark / light mode', nl: 'Wissel tussen donker en licht' },
    language: { en: 'Language', nl: 'Taal' },
    gameStart: { en: 'Play: catch the website', nl: 'Speel: vang de website' },
    gameTitle: { en: 'Catch the website', nl: 'Vang de website' },
    gameExit: { en: 'Stop and restore the website', nl: 'Stoppen en website herstellen' },
    gameHint: {
      en: 'Arrows / WASD to fly · Space to shoot · 1 2 3 to use items · or hold the mouse to steer and auto-fire · Esc to stop',
      nl: 'Pijltjes / WASD om te vliegen · Spatie om te schieten · 1 2 3 voor items · of houd de muis ingedrukt (schiet automatisch) · Esc om te stoppen',
    },
    gameHintTouch: {
      en: 'Hold your finger on the screen to steer, the ship fires by itself. Tap an item to use it',
      nl: 'Houd je vinger op het scherm om te sturen, het schip schiet vanzelf. Tik op een item om het te gebruiken',
    },
    gameHealth: { en: 'Health: {n} of {max}', nl: 'Levens: {n} van {max}' },
    gameKills: { en: ['{n} bug squashed', '{n} bugs squashed'], nl: ['{n} bug geplet', '{n} bugs geplet'] },
    gameLost: { en: 'Ship destroyed!', nl: 'Schip vernietigd!' },
    gameLostText: { en: 'You survived {time}.', nl: 'Je hield het {time} vol.' },
    gameRetry: { en: 'Try again', nl: 'Opnieuw' },
    gameSlimed: { en: 'Slimed!', nl: 'Geslijmd!' },
    gameLevel: { en: 'Level {n}', nl: 'Level {n}' },
    gameLevelShort: { en: 'Lv {n}', nl: 'Lv {n}' },
    gameLevelUp: { en: 'More bugs incoming!', nl: 'Meer bugs op komst!' },
    gameNextLevel: { en: 'Progress to the next level', nl: 'Voortgang naar het volgende level' },
    gameReached: { en: 'Reached level {n}', nl: 'Level {n} gehaald' },
    gameInventory: { en: 'Items (keys 1 – 3)', nl: 'Items (toetsen 1 – 3)' },
    gameSlotEmpty: { en: 'Slot {key}: empty', nl: 'Vak {key}: leeg' },
    itemShield: { en: 'Shield', nl: 'Schild' },
    itemPush: { en: 'Push', nl: 'Duwgolf' },
    itemMultishot: { en: 'Multishot', nl: 'Multishot' },
    itemMine: { en: 'Mine', nl: 'Mijn' },
    itemMagnet: { en: 'Orb magnet', nl: 'Orb-magneet' },
    itemKillall: { en: 'Kill-all', nl: 'Alles opblazen' },
    gameNewBest: { en: 'New high score!', nl: 'Nieuw record!' },
    gameBest: { en: 'High score: {n} orbs', nl: 'Record: {n} orbs' },
    gameOrbs: { en: 'Orbs collected', nl: 'Verzamelde orbs' },
    gameOrbsShort: { en: 'orbs', nl: 'orbs' },
    gameRestore: { en: 'Put it back together', nl: 'Zet alles weer terug' },
  },

  // ------------------------------------------------------------
  //  Header
  // ------------------------------------------------------------
  profile: {
    name: 'Rvgate Development',
    role: 'René van Aerle - DevOps Engineer',
    intro: {
      en: 'DevOps engineer with a solid background in software development. ' +
        'I keep production-critical platforms running and automate everything I can.',
      nl: 'DevOps-engineer met een stevige achtergrond in softwareontwikkeling. ' +
        'Ik houd bedrijfskritische platforms draaiende en automatiseer alles wat kan.',
    },
    avatar: '/img/avatar.png', // file lives in public/img/
  },

  // ------------------------------------------------------------
  //  Sections: order, titles and on/off.
  //  Reorder the lines to reorder the page; remove a line (or set
  //  `hidden: true`) to hide a section. Numbers are automatic.
  //  `primary: true` makes that section's button in the top
  //  navigation stand out as the main call to action.
  //  `print: false` leaves a section out of print and the PDF.
  // ------------------------------------------------------------
  sections: [
    { id: 'skills', title: 'Skills' },
    { id: 'experience', title: { en: 'Experience', nl: 'Ervaring' } },
    { id: 'projects', title: { en: 'Projects', nl: 'Projecten' } },
    { id: 'about-me', title: { en: 'About me', nl: 'Over mij' } },
    { id: 'services', title: { en: 'Services', nl: 'Diensten' } },
    { id: 'contact', title: 'Contact', primary: true, print: false },
  ],

  // ------------------------------------------------------------
  //  Skills mood board
  //  level: 1 (small) – 3 (big / strongest)
  //  category: one of the keys in `skillCategories`
  //  Clicking a skill highlights experience entries whose `tags`
  //  contain the same name.
  // ------------------------------------------------------------
  skillCategories: {
    lang: { label: { en: 'Programming languages', nl: 'Programmeertalen' }, color: 'blue' },
    infra: { label: { en: 'DevOps & infrastructure', nl: 'DevOps & infrastructuur' }, color: 'teal' },
    data: { label: { en: 'Data & messaging', nl: 'Data & messaging' }, color: 'orange' },
    tool: { label: { en: 'Frameworks & tools', nl: 'Frameworks & tools' }, color: 'purple' },
    ai: { label: 'AI', color: 'green' },
    soft: { label: { en: 'Ways of working', nl: 'Werkwijze' }, color: 'pink' },
  },

  skills: [
    { name: 'Python', category: 'lang', level: 3 },
    { name: 'Ansible', category: 'infra', level: 3 },
    { name: 'Linux', category: 'infra', level: 3 },
    { name: 'Django', category: 'tool', level: 2 },
    { name: 'Claude', category: 'ai', level: 2 },
    { name: 'Vue.js', category: 'tool', level: 3 },
    { name: 'TypeScript', category: 'lang', level: 2 },
    { name: 'FastAPI', category: 'tool', level: 3 },
    { name: 'Kubernetes', category: 'infra', level: 2 },
    { name: 'Terraform', category: 'infra', level: 2 },
    { name: 'Firebase', category: 'data', level: 2 },
    { name: 'PostgreSQL', category: 'data', level: 2 },
    { name: 'PHP', category: 'lang', level: 2 },
    { name: 'Team lead', category: 'soft', level: 2 },
    { name: 'Docker', category: 'infra', level: 2 },
    { name: 'Symfony2', category: 'tool', level: 2 },
    { name: 'Jenkins', category: 'infra', level: 2 },
    { name: 'MySQL', category: 'data', level: 2 },
    { name: 'Prometheus', category: 'infra', level: 2 },
    { name: 'CI/CD', category: 'infra', level: 2 },
    { name: 'JavaScript', category: 'lang', level: 2 },
    { name: 'Unit testing', category: 'tool', level: 2 },
    { name: 'Scrum', category: 'soft', level: 2 },
    { name: 'Kafka', category: 'data', level: 2 },
    { name: 'Bash', category: 'lang', level: 2 },
    { name: 'Git', category: 'tool', level: 2 },
    { name: 'Cassandra', category: 'data', level: 1 },
    { name: 'Product owner', category: 'soft', level: 1 },
    { name: 'Java', category: 'lang', level: 1 },
    { name: 'web.py', category: 'tool', level: 1 },
    { name: 'Redis', category: 'data', level: 2 },
    { name: 'Genesys Cloud', category: 'tool', level: 2 },
    { name: 'OpenSearch', category: 'data', level: 1 },
    { name: 'Celery', category: 'tool', level: 1 },
    { name: 'Helm', category: 'infra', level: 1 },
    { name: 'Sentry', category: 'infra', level: 1 },
    { name: 'Opsgenie', category: 'infra', level: 1 },
    { name: 'Tailwind CSS', category: 'tool', level: 1 },
    { name: 'Grafana', category: 'infra', level: 1 },
    { name: 'HTML/CSS', category: 'lang', level: 1 },
    { name: 'Nginx', category: 'infra', level: 1 },
    { name: 'CakePHP', category: 'tool', level: 1 },
    { name: 'Nagios', category: 'infra', level: 1 },
    { name: 'Angular', category: 'tool', level: 1 },
    { name: 'Apache', category: 'infra', level: 1 },
    { name: 'GitLab', category: 'infra', level: 1 },
    { name: 'GitHub', category: 'infra', level: 2 },
    { name: 'Selenium', category: 'tool', level: 1 },
    { name: 'Opsview', category: 'infra', level: 1 },
    { name: 'Jira', category: 'tool', level: 1 },
    { name: 'Copilot', category: 'ai', level: 1 },
    { name: 'ChatGPT', category: 'ai', level: 1 },
    { name: 'AWS', category: 'infra', level: 2 },
    { name: 'Capacitor', category: 'tool', level: 1 },
    { name: 'Android', category: 'tool', level: 1 },
    { name: 'WordPress', category: 'tool', level: 1 },
    { name: 'IntelliJ IDEA Ultimate', category: 'tool', level: 1 },
  ],

  // ------------------------------------------------------------
  //  Experience: timelines shown side by side (most recent first).
  //  Add or remove timelines freely.
  //
  //  Dates: 'YYYY-MM', or just 'YYYY' when the month is unknown
  //  (then no duration is shown).
  //
  //  Optional per entry:
  //    url:   makes the company name a link (e.g. their website)
  //    links: buttons at the bottom of the card, e.g.
  //           [{ label: 'Case study', url: 'https://…', icon: 'link' }]
  //           (icon is optional; defaults to 'link')
  //    older: true hides the entry behind the "Go further into the
  //           past" button (it is always shown in print / the PDF)
  // ------------------------------------------------------------
  timelines: [
    {
      title: { en: 'Employment', nl: 'Loondienst' },
      icon: 'briefcase',
      accent: 'blue',
      items: [
        {
          title: 'Software Engineer',
          company: 'KPN',
          url: 'https://www.kpn.com/',
          location: 'Omni',
          from: '2018-07',
          to: null,
          description: {
            en: 'Building Omni, KPN\'s own CRM that agents in call centres, retail stores, back offices and the field ' +
              'use to view and manage customer data, products and cases. I work across the whole stack: ' +
              'front-end, back-end services, contact-centre integration and infrastructure.',
            nl: 'Bouwen aan Omni, KPN\'s eigen CRM waarmee medewerkers in callcenters, winkels, backoffices en de buitendienst ' +
              'klantgegevens, producten en cases bekijken en beheren. Ik werk over de hele stack: ' +
              'front-end, back-endservices, contactcenterintegratie en infrastructuur.',
          },
          highlights: [
            {
              en: 'Front-end in Vue 3 and TypeScript with Pinia, Tailwind CSS and the KPN design system, tested with Vitest and Playwright',
              nl: 'Front-end in Vue 3 en TypeScript met Pinia, Tailwind CSS en het KPN-designsystem, getest met Vitest en Playwright',
            },
            {
              en: 'Python/FastAPI services: a backend-for-frontend that combines the downstream systems into one API, a service for customer cases and sub-tasks, and task orchestration, using PostgreSQL, Redis, Kafka, OpenSearch and Celery',
              nl: 'Python/FastAPI-services: een backend-for-frontend die de achterliggende systemen samenbrengt in één API, een service voor klantcases en subtaken, en taakorkestratie, met PostgreSQL, Redis, Kafka, OpenSearch en Celery',
            },
            {
              en: 'Genesys Cloud integration for routing calls, e-mails and tasks, with its configuration managed as code in Terraform and Python tooling for work items',
              nl: 'Genesys Cloud-integratie voor het routeren van gesprekken, e-mails en taken, met de configuratie als code in Terraform en Python-tooling voor workitems',
            },
            {
              en: 'Infrastructure on AWS and Kubernetes: Helm charts, the shared ingress layer, Aurora PostgreSQL and OpenSearch via CloudFormation, and Redis via Terraform',
              nl: 'Infrastructuur op AWS en Kubernetes: Helm-charts, de gedeelde ingress-laag, Aurora PostgreSQL en OpenSearch via CloudFormation, en Redis via Terraform',
            },
            {
              en: 'Observability and delivery: Sentry, OpenTelemetry and Grafana, CI/CD with GitHub Actions and Jenkins, and Trivy security scans',
              nl: 'Observability en oplevering: Sentry, OpenTelemetry en Grafana, CI/CD met GitHub Actions en Jenkins, en Trivy-securityscans',
            },
          ],
          tags: ['Vue.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Kafka', 'OpenSearch', 'Celery',
            'Genesys Cloud', 'Terraform', 'Kubernetes', 'Helm', 'AWS', 'Docker', 'Sentry', 'Grafana', 'Jenkins',
            'CI/CD', 'Tailwind CSS', 'Unit testing', 'Copilot', 'IntelliJ IDEA Ultimate',
            'Opsgenie', 'Scrum', 'Bash', 'Git', 'GitLab', 'Jira', 'GitHub'],
          links: [{ label: 'kpn.com', url: 'https://www.kpn.com/', icon: 'globe' }],
        },
        {
          title: 'Ops Engineer',
          company: 'ING',
          url: 'https://www.ing.nl/',
          location: 'Amsterdam',
          from: '2016-11',
          to: '2018-06',
          description: {
            en: 'Wholesale Banking – Inside Business Portal. Keeping production-critical applications ' +
              'up and running while providing a semi-automated DTAP deployment process.',
            nl: 'Wholesale Banking – Inside Business Portal. Bedrijfskritische applicaties in productie ' +
              'draaiende houden en zorgen voor een semi-geautomatiseerd DTAP-deploymentproces.',
          },
          highlights: [
            {
              en: 'Managing DTAP environments, partly with legacy tooling, and introducing Ansible for easier maintenance, daily tasks and deployments',
              nl: 'DTAP-omgevingen beheren, deels met legacy tooling, en Ansible introduceren voor eenvoudiger onderhoud, dagelijkse taken en deployments',
            },
            {
              en: 'Improving the existing CI procedures in Jenkins',
              nl: 'De bestaande CI-procedures in Jenkins verbeteren',
            },
            {
              en: 'Introducing better monitoring with Prometheus',
              nl: 'Betere monitoring introduceren met Prometheus',
            },
            {
              en: 'Developing smaller supporting applications in Python',
              nl: 'Kleinere ondersteunende applicaties ontwikkelen in Python',
            },
          ],
          tags: ['Ansible', 'Jenkins', 'Prometheus', 'Python', 'CI/CD', 'Linux', 'Scrum', 'Bash', 'Git', 'GitLab',
            'Angular', 'Jira', 'Selenium'],
          links: [{ label: 'ing.nl', url: 'https://www.ing.nl/', icon: 'globe' }],
        },
        {
          title: {
            en: 'DevOps Software Engineer, Team lead & Product owner',
            nl: 'DevOps Software Engineer, teamlead & product owner',
          },
          company: 'LeaseWeb',
          url: 'https://www.leaseweb.com/',
          location: 'Amsterdam',
          from: '2013-06',
          to: '2016-10',
          description: {
            en: 'CDN department. Responsible for all CDN infrastructure and development within a ' +
              'self-managing team: 300+ servers plus internal and customer-facing software. ' +
              'I worked on all four major sub-projects of the CDN product.',
            nl: 'Afdeling CDN. Verantwoordelijk voor alle CDN-infrastructuur en -ontwikkeling binnen een ' +
              'zelfsturend team: 300+ servers plus interne en klantgerichte software. ' +
              'Ik werkte aan alle vier de grote deelprojecten van het CDN-product.',
          },
          highlights: [
            {
              en: 'RESTful API (Python, web.py): took ownership, added unit tests and team standards for faster, safer deployments',
              nl: 'RESTful API (Python, web.py): eigenaarschap overgenomen, unittests en teamstandaarden ingevoerd voor snellere, veiligere deployments',
            },
            {
              en: 'Customer dashboard (Symfony2): rewrote it to use the API directly, with functional and unit tests',
              nl: 'Klantdashboard (Symfony2): herschreven zodat het direct de API gebruikt, met functionele en unittests',
            },
            {
              en: 'Infrastructure: Ansible playbooks to install and run 300+ bare-metal Ubuntu servers; debugging the live platform',
              nl: 'Infrastructuur: Ansible-playbooks om 300+ bare-metal Ubuntu-servers te installeren en te beheren; problemen op het live platform oplossen',
            },
            {
              en: 'Statistics ("Apollo"): complete rewrite of the customer statistics, processing 60,000 log lines per second',
              nl: 'Statistieken ("Apollo"): volledige herbouw van de klantstatistieken, 60.000 logregels per seconde',
            },
            {
              en: 'Various PHP and Python tools for insight into the full CDN platform',
              nl: 'Diverse PHP- en Python-tools voor inzicht in het volledige CDN-platform',
            },
          ],
          tags: ['Python', 'web.py', 'Django', 'Symfony2', 'PHP', 'Java', 'Ansible', 'Kafka', 'Cassandra',
            'Linux', 'Unit testing', 'Team lead', 'Product owner', 'Scrum', 'Bash', 'Git', 'MySQL', 'Apache',
            'GitLab', 'Nagios', 'Opsview', 'Angular', 'Grafana'],
          links: [{ label: 'leaseweb.com', url: 'https://www.leaseweb.com/', icon: 'globe' }],
        },
        {
          title: { en: 'Intern, Innovation Team Cloud', nl: 'Stagiair, Innovatieteam Cloud' },
          company: 'LeaseWeb',
          older: true,
          url: 'https://www.leaseweb.com/',
          location: 'Haarlem',
          from: '2013-01',
          to: '2013-05',
          description: {
            en: 'Full-time internship in the Cloud department: implemented and integrated Pentaho ' +
              'Business Intelligence for operational data using Symfony2 and PHP.',
            nl: 'Fulltime stage bij de afdeling Cloud: Pentaho Business Intelligence voor operationele ' +
              'data geïmplementeerd en geïntegreerd met Symfony2 en PHP.',
          },
          highlights: [
            {
              en: 'Gave management insight into the platform, such as exactly how many VMs were running at any time, to support the right decisions',
              nl: 'Gaf het management inzicht in het platform, zoals precies hoeveel VM\'s er op elk moment draaiden, om de juiste beslissingen te nemen',
            },
          ],
          tags: ['Symfony2', 'PHP', 'Pentaho', 'Git'],
          links: [{ label: 'leaseweb.com', url: 'https://www.leaseweb.com/', icon: 'globe' }],
        },
        {
          title: { en: 'PHP Programmer', nl: 'PHP-programmeur' },
          company: 'Exed Internet',
          older: true,
          url: 'https://www.exed.nl/',
          location: 'Lelystad',
          from: '2011-06',
          to: '2013-01',
          description: {
            en: 'Full-time website development and maintenance using Drupal, WordPress and ExedCMS.',
            nl: 'Fulltime websites ontwikkelen en onderhouden met Drupal, WordPress en ExedCMS.',
          },
          tags: ['PHP', 'Drupal', 'WordPress', 'Apache', 'Git'],
          links: [{ label: 'exed.nl', url: 'https://www.exed.nl/', icon: 'globe' }],
        },
        {
          title: { en: 'ICT Administrator & Programmer', nl: 'ICT-beheerder & programmeur' },
          company: 'Overhoff Dataservices, Bevede Automatiseringsdiensten',
          older: true,
          location: { en: 'MBO internships', nl: 'Mbo-stages' },
          from: '2005',
          to: '2009',
          description: {
            en: 'Three full-time internships of six months each during my MBO education.',
            nl: 'Drie fulltime stages van elk zes maanden tijdens mijn mbo-opleiding.',
          },
          links: [
            { label: 'overhoffict.nl', url: 'https://overhoffict.nl/', icon: 'globe' },
            { label: 'bevede.nl', url: 'http://bevede.nl/', icon: 'globe' },
          ],
        },
      ],
    },
    {
      title: 'Freelance',
      icon: 'bolt',
      accent: 'teal',
      items: [
        {
          title: { en: 'Freelance software & DevOps engineer', nl: 'Freelance software- & DevOps-engineer' },
          company: 'Rvgate Development',
          url: 'https://rvgate.nl/',
          location: { en: 'Self-employed', nl: 'Zelfstandig' },
          from: '2023-09',
          to: null,
          description: {
            en: 'Restarted my own company for freelance software development, DevOps and IT support, ' +
              'and to build my own product, Carambole Computer.',
            nl: 'Mijn eigen bedrijf opnieuw gestart voor freelance softwareontwikkeling, DevOps en IT-support, ' +
              'en om mijn eigen product te bouwen: Carambole Computer.',
          },
          links: [{ label: 'rvgate.nl', url: 'https://rvgate.nl/', icon: 'globe' }],
        },
        {
          title: 'IT Support',
          company: 'SamenInGeld',
          url: 'https://sameningeld.nl/',
          location: { en: 'Real-estate crowdfunding platform', nl: 'Crowdfundingplatform voor vastgoed' },
          from: '2023-09',
          to: null,
          description: {
            en: 'IT support for SamenInGeld, a crowdfunding platform for real-estate investment and business financing.',
            nl: 'IT-support voor SamenInGeld, een crowdfundingplatform voor investeren in vastgoed en zakelijke financiering.',
          },
          highlights: [
            {
              en: 'Reducing the costs of the IT landscape',
              nl: 'De kosten van het IT-landschap verlagen',
            },
            {
              en: 'Advising on IT-related topics for daily operations',
              nl: 'Advies over IT-gerelateerde onderwerpen voor de dagelijkse operatie',
            },
            {
              en: 'Building a WordPress plugin for the return calculator ("rendement berekening") on the website',
              nl: 'Een WordPress-plugin bouwen voor de rendementsberekening op de website',
            },
          ],
          tags: ['Ansible', 'AWS', 'WordPress', 'MySQL', 'Git'],
          links: [
            { label: 'sameningeld.nl', url: 'https://sameningeld.nl/', icon: 'globe' },
          ],
        },
        {
          title: { en: 'Founder & developer', nl: 'Oprichter & ontwikkelaar' },
          company: 'Carambole Computer',
          url: 'https://carambolecomputer.nl/',
          location: { en: 'Own product', nl: 'Eigen product' },
          from: '2022-01',
          to: null,
          description: {
            en: 'Scoreboard platform for carom billiards clubs: an Android and Android TV scoreboard app, ' +
              'a web portal for clubs and players, and the cloud back-end behind it.',
            nl: 'Scorebordplatform voor biljartverenigingen: een scorebord-app voor Android en Android TV, ' +
              'een webportaal voor clubs en spelers, en de cloud-back-end daarachter.',
          },
          highlights: [
            {
              en: 'Scoreboard app in Vue 3, TypeScript and Vuetify, packaged with Capacitor, with custom native plugins for Android TV and auto-start',
              nl: 'Scorebord-app in Vue 3, TypeScript en Vuetify, verpakt met Capacitor, met eigen native plugins voor Android TV en autostart',
            },
            {
              en: 'Web portal (Vue 3, Pinia, Firebase) for accounts, subscriptions, players, match history, live streams and remote control',
              nl: 'Webportaal (Vue 3, Pinia, Firebase) voor accounts, abonnementen, spelers, wedstrijdhistorie, livestreams en bediening op afstand',
            },
            {
              en: 'REST API in FastAPI with async SQLAlchemy, PostgreSQL and Alembic, running in Docker and deployed with GitHub Actions and Ansible',
              nl: 'REST-API in FastAPI met async SQLAlchemy, PostgreSQL en Alembic, draaiend in Docker en uitgerold met GitHub Actions en Ansible',
            },
            {
              en: 'Firebase back-end: Firestore, authentication and Cloud Functions in TypeScript, including invoicing through Moneybird',
              nl: 'Firebase-back-end: Firestore, authenticatie en Cloud Functions in TypeScript, inclusief facturatie via Moneybird',
            },
            {
              en: 'Scheduled Python jobs for subscriptions, trials, e-mail notifications and invoice sync, and crawlers that import players and results from billiards sites',
              nl: 'Geplande Python-jobs voor abonnementen, proefaccounts, e-mailnotificaties en factuursynchronisatie, en crawlers die spelers en uitslagen van biljartsites importeren',
            },
          ],
          tags: ['Vue.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Firebase', 'Capacitor', 'Android',
            'Docker', 'Ansible', 'CI/CD', 'Claude', 'IntelliJ IDEA Ultimate', 'Git', 'GitHub'],
          links: [
            { label: 'carambolecomputer.nl', url: 'https://carambolecomputer.nl/', icon: 'globe' },
          ],
        },
        {
          title: { en: 'Web developer, front-end & back-end', nl: 'Webdeveloper, front-end & back-end' },
          company: 'Rvgate Web development',
          older: true,
          location: { en: 'Self-employed, part-time', nl: 'Zelfstandig, parttime' },
          from: '2004-11',
          to: '2011-02',
          description: {
            en: 'Web development alongside my studies and jobs, for clients such as Action This Day, ' +
              'Oefenweb, Perfectblue, EMPC and MASC Software.',
            nl: 'Webontwikkeling naast mijn studie en banen, voor klanten als Action This Day, ' +
              'Oefenweb, Perfectblue, EMPC en MASC Software.',
          },
          tags: ['PHP', 'JavaScript', 'HTML/CSS', 'CakePHP', 'Git'],
        },
      ],
    },
  ],

  // ------------------------------------------------------------
  //  Projects (link is optional)
  // ------------------------------------------------------------
  projects: [
    {
      name: 'Infrastructure',
      year: { en: '2017 – now', nl: '2017 – nu' },
      description: {
        en: 'Ansible repository that sets up and runs my own servers, from a VPS to Raspberry Pis: Docker hosts, ' +
          'an nginx ingress with Let\'s Encrypt certificates, self-hosted GitHub Actions runners, monitoring, VPN, ' +
          'Pi-hole and Home Assistant, with secrets kept in Ansible Vault. It also deploys my apps, including this website.',
        nl: 'Ansible-repository die mijn eigen servers inricht en beheert, van VPS tot Raspberry Pi: Docker-hosts, ' +
          'een nginx-ingress met Let\'s Encrypt-certificaten, eigen GitHub Actions-runners, monitoring, VPN, ' +
          'Pi-hole en Home Assistant, met secrets in Ansible Vault. Het rolt ook mijn apps uit, waaronder deze website.',
      },
      tags: ['Ansible', 'Docker', 'Linux', 'Nginx', 'CI/CD', 'Git'],
      link: { label: { en: 'View on GitHub', nl: 'Bekijk op GitHub' }, url: 'https://github.com/rvgate/infrastructure' },
    },
    {
      name: 'Carambole Computer',
      year: { en: '2022 – now', nl: '2022 – nu' },
      description: {
        en: 'Scoreboard platform for carom billiards clubs. What started as a hobby project and an experiment ' +
          'grew into a full commercial product, built with everything I have learned over the years.',
        nl: 'Scorebordplatform voor biljartverenigingen. Wat begon als hobbyproject en experiment ' +
          'groeide uit tot een volwaardig commercieel product, gebouwd met alles wat ik door de jaren heen heb geleerd.',
      },
      tags: ['Vue.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Firebase', 'Capacitor', 'Android',
        'Docker', 'Ansible', 'CI/CD', 'Claude', 'IntelliJ IDEA Ultimate', 'Git', 'GitHub'],
      link: { label: 'carambolecomputer.nl', url: 'https://carambolecomputer.nl/', icon: 'globe' },
    },
    {
      name: { en: 'Patterns', nl: 'Patronen' },
      year: 'Carambole Computer',
      description: {
        en: 'A searchable online atlas of carom billiards shots, based on the book "Van Groot Spel tot Serie Américaine": ' +
          'gathering patterns for the Serie Américaine and balkline, organised per chapter with diagrams and quick search.',
        nl: 'Een doorzoekbare online atlas met biljartstoten, gebaseerd op het boek "Van Groot Spel tot Serie Américaine": ' +
          'verzamelpatronen voor de Serie Américaine en het kaderspel, per hoofdstuk geordend met platen en snel zoeken.',
      },
      tags: ['JavaScript', 'HTML/CSS', 'Git'],
      link: { label: 'patronen.carambolecomputer.nl', url: 'https://patronen.carambolecomputer.nl/', icon: 'globe' },
    },
  ],

  // ------------------------------------------------------------
  //  Favourites: small tiles with an icon, a label and your pick.
  //  color is optional (colours rotate); `hidden: true` keeps an
  //  item in this file without showing it on the site.
  // ------------------------------------------------------------
  favorites: {
    intro: {
      en: 'A little more about me, at and away from the keyboard.',
      nl: 'Iets meer over mij, achter en weg van het toetsenbord.',
    },
    items: [
      { icon: 'code', label: 'IDE', value: 'IntelliJ IDEA Ultimate' },
      {
        icon: 'monitor',
        label: { en: 'Desktop OS', nl: 'Desktop-OS' },
        value: 'Fedora Linux',
      },
      {
        icon: 'server',
        label: { en: 'Server OS', nl: 'Server-OS' },
        value: { en: 'Fedora or Ubuntu', nl: 'Fedora of Ubuntu' },
      },
      {
        icon: 'moon',
        label: { en: 'Time of day', nl: 'Moment van de dag' },
        value: { en: 'Evenings', nl: 'De avond' },
      },
      {
        icon: 'dice',
        label: { en: 'Board games', nl: 'Bordspellen' },
        value: { en: 'Root & Earthborne Rangers', nl: 'Root & Earthborne Rangers' },
      },
      {
        icon: 'heart',
        label: 'Hobbies',
        value: { en: 'Billiards, Squash & Gaming', nl: 'Biljarten, squash & gamen' },
      },
      {
        icon: 'motorcycle',
        label: { en: 'Motorcycle', nl: 'Motor' },
        value: 'Yamaha MT-09',
      },
      {
        icon: 'plane',
        label: { en: 'Holiday destination', nl: 'Vakantiebestemming' },
        value: { en: 'Spain', nl: 'Spanje' },
      },
      {
        icon: 'chat',
        label: { en: 'Languages', nl: 'Talen' },
        value: { en: 'English & Dutch', nl: 'Engels & Nederlands' },
      },

      {
        icon: 'code',
        label: { en: 'Programming language', nl: 'Programmeertaal' },
        value: 'Python',
      },
      { icon: 'sparkles', label: 'AI', value: 'Claude' },
      {
        icon: 'gamepad',
        label: { en: 'Game', nl: 'Game' },
        value: 'Counter-Strike 2',
      },
      {
        icon: 'coffee',
        label: { en: 'Fuel', nl: 'Brandstof' },
        value: { en: 'Tea & Chai Latte', nl: 'Thee & Chai Latte' },
      },
      {
        icon: 'music',
        label: { en: 'Music', nl: 'Muziek' },
        value: 'Drum & Bass',
      },
      {
        icon: 'moon',
        label: { en: 'Theme', nl: 'Thema' },
        value: { en: 'Dark', nl: 'Donker' },
      },
      {
        icon: 'terminal',
        label: { en: 'Tabs or spaces', nl: 'Tabs of spaties' },
        value: { en: 'Spaces', nl: 'Spaties' },
      },
    ],
  },

  // ------------------------------------------------------------
  //  Services (color is optional; colours rotate when omitted)
  // ------------------------------------------------------------
  services: {
    intro: {
      en: 'Available for freelance work and consultancy. Here is what I can help you with.',
      nl: 'Beschikbaar voor freelance opdrachten en advies. Hiermee kan ik je helpen.',
    },
    items: [
      {
        icon: 'cloud',
        title: { en: 'Automation', nl: 'Automatisering' },
        description: {
          en: 'Automating deployments, maintenance and repetitive daily tasks, so releases are reliable and your team can focus on what matters.',
          nl: 'Deployments, onderhoud en terugkerende dagelijkse taken automatiseren, zodat releases betrouwbaar zijn en je team zich kan richten op wat belangrijk is.',
        },
      },
      {
        icon: 'code',
        title: { en: 'Software Development', nl: 'Softwareontwikkeling' },
        description: {
          en: 'Got a great idea for a piece of software and need someone to turn it into reality? I can help you build it.',
          nl: 'Heb je een goed idee voor software en zoek je iemand die het werkelijkheid maakt? Ik help je het te bouwen.',
        },
      },
      {
        icon: 'pulse',
        title: { en: 'Monitoring & Operations', nl: 'Monitoring & operations' },
        description: {
          en: 'Keeping production-critical applications running, with monitoring that spots problems before your users do.',
          nl: 'Bedrijfskritische applicaties draaiende houden, met monitoring die problemen opmerkt voordat je gebruikers dat doen.',
        },
      },
      {
        icon: 'server',
        title: { en: 'Server Infrastructure', nl: 'Serverinfrastructuur' },
        description: {
          en: 'Setting up and managing servers at any scale, from a handful of machines to hundreds.',
          nl: 'Servers inrichten en beheren op elke schaal, van een handvol machines tot honderden.',
        },
      },
      {
        icon: 'chat',
        title: 'Consultancy',
        description: {
          en: 'Got a complex IT question? Let\'s sit down together and find out what is really needed.',
          nl: 'Een complexe IT-vraag? Laten we samen om tafel gaan en uitzoeken wat er echt nodig is.',
        },
      },
    ],
  },

  // ------------------------------------------------------------
  //  Contact (leave out `url` for plain text, e.g. a location)
  // ------------------------------------------------------------
  contact: {
    intro: {
      en: 'Want to work together or just say hi? Get in touch.',
      nl: 'Samenwerken of gewoon even hallo zeggen? Neem contact op.',
    },
    // contact details shown as tiles, e.g.
    // { icon: 'mail', label: 'info@example.com', url: 'mailto:info@example.com' }
    items: [],
    // contact form, sent through the backend in api/ (remove to hide it)
    form: {
      title: { en: 'Send a message', nl: 'Stuur een bericht' },
      name: { en: 'Name', nl: 'Naam' },
      email: { en: 'E-mail', nl: 'E-mail' },
      phone: { en: 'Phone', nl: 'Telefoon' },
      optional: { en: 'optional', nl: 'optioneel' },
      reason: { en: 'Reason for contact', nl: 'Reden van contact' },
      // `value` is what ends up in the e-mail subject
      reasons: [
        { value: 'Job opportunity', label: { en: 'Job opportunity', nl: 'Vacature / baan' } },
        { value: 'Freelance assignment', label: { en: 'Freelance assignment', nl: 'Freelanceopdracht' } },
        { value: 'Project or quote request', label: { en: 'Project or quote request', nl: 'Project of offerteaanvraag' } },
        { value: 'DevOps & automation', label: { en: 'DevOps & automation', nl: 'DevOps & automatisering' } },
        { value: 'Software development', label: { en: 'Software development', nl: 'Softwareontwikkeling' } },
        { value: 'Servers & hosting', label: { en: 'Servers & hosting', nl: 'Servers & hosting' } },
        { value: 'Monitoring & support', label: { en: 'Monitoring & support', nl: 'Monitoring & ondersteuning' } },
        { value: 'Consultancy & advice', label: { en: 'Consultancy & advice', nl: 'Consultancy & advies' } },
        { value: 'Carambole Computer', label: 'Carambole Computer' },
        { value: 'Collaboration', label: { en: 'Collaboration', nl: 'Samenwerking' } },
        { value: 'Just saying hi', label: { en: 'Just saying hi', nl: 'Gewoon even hallo zeggen' } },
        { value: 'Something else', label: { en: 'Something else', nl: 'Iets anders' } },
      ],
      source: { en: 'How did you hear about me?', nl: 'Hoe heb je mij gevonden?' },
      choose: { en: 'Choose…', nl: 'Kies…' },
      // `value` is what ends up in the e-mail; `other: true` asks the visitor to type it
      sources: [
        { value: 'Google / search engine', label: { en: 'Google / search engine', nl: 'Google / zoekmachine' } },
        { value: 'LinkedIn', label: 'LinkedIn' },
        { value: 'GitHub', label: 'GitHub' },
        { value: 'Recommendation', label: { en: 'Recommendation from someone', nl: 'Aanbevolen door iemand' } },
        { value: 'Former colleague', label: { en: 'Former colleague', nl: 'Oud-collega' } },
        { value: 'Friend', label: { en: 'I\'m a friend', nl: 'Ik ben een vriend' } },
        { value: 'Recruiter', label: 'Recruiter' },
        { value: 'Carambole Computer', label: 'Carambole Computer' },
        { value: 'Other', label: { en: 'Different, namely…', nl: 'Anders, namelijk…' }, other: true },
      ],
      sourceOther: { en: 'Where did you hear about me?', nl: 'Waar heb je over mij gehoord?' },
      message: { en: 'Message', nl: 'Bericht' },
      send: { en: 'Send message', nl: 'Verstuur bericht' },
      sending: { en: 'Sending…', nl: 'Versturen…' },
      sent: {
        en: 'Thanks for your message! I will get back to you as soon as possible.',
        nl: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
      },
      again: { en: 'Send another message', nl: 'Nog een bericht sturen' },
      // shown under the field (first group) or above the send button (last group)
      errors: {
        nameRequired: { en: 'Please enter your name.', nl: 'Vul je naam in.' },
        emailRequired: { en: 'Please enter your e-mail address.', nl: 'Vul je e-mailadres in.' },
        email: {
          en: 'That doesn\'t look like a valid e-mail address.',
          nl: 'Dat lijkt geen geldig e-mailadres.',
        },
        phone: {
          en: 'Use only digits, spaces and + ( ) - . (at least 6 characters).',
          nl: 'Gebruik alleen cijfers, spaties en + ( ) - . (minimaal 6 tekens).',
        },
        sourceOtherRequired: {
          en: 'Please tell me where you heard about me.',
          nl: 'Laat me weten waar je over mij hebt gehoord.',
        },
        messageRequired: { en: 'Please write a message.', nl: 'Schrijf een bericht.' },
        check: {
          en: 'Please check the highlighted fields.',
          nl: 'Controleer de gemarkeerde velden.',
        },
        rate_limited: {
          en: 'You have sent several messages already. Please try again later.',
          nl: 'Je hebt al een paar berichten gestuurd. Probeer het later nog eens.',
        },
        failed: {
          en: 'Sorry, your message could not be sent. Please try again in a moment.',
          nl: 'Sorry, je bericht kon niet worden verstuurd. Probeer het zo nog eens.',
        },
      },
    },
  },

  // ------------------------------------------------------------
  //  Fun stuff when a skill is clicked
  // ------------------------------------------------------------
  effects: {
    confetti: true, // confetti burst from the "Highlighting …" chip
    sound: true,    // soft chime
  },

  footer: '© {year} René van Aerle · rvgate.nl', // {year} = current year
}
