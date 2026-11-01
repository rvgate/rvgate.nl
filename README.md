# rvgate.nl

My online CV: a single-page Vue 3 + Vite site.

## Editing the content

**All text lives in [`src/content.js`](src/content.js)** — profile, skills, both
experience timelines, projects, services and contact details. The comments at
the top of that file explain the available colours, icons and date format.
Images go in `public/img/`.

## Development

```sh
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build in dist/, including the PDF resumés
npm run build:site  # production build without generating the PDFs
npm run preview   # serve the production build
```

## PDF resumé

`npm run build` also creates `dist/resume-en.pdf` and `dist/resume-nl.pdf`
(`scripts/build-pdf.mjs`): it serves the build and prints it with headless
Chrome/Chromium using the print styles (`@media print`). The **Resumé** button
at the top right links to the PDF in the current language. Needs Chrome or
Chromium (set `CHROME_BIN` to pick one, or `SKIP_PDF=1` to skip). In
`npm run dev` the PDFs don't exist yet: run `npm run build && npm run preview`.

## Structure

```
src/
├── content.js                 ← all site content
├── App.vue                    ← page layout, renders sections in content order
├── styles/main.css            ← theme colours (dark/light), shared styles, print
├── components/
│   ├── HeroHeader.vue         ← avatar, name, intro, nav
│   ├── SectionTitle.vue       ← "01 Skills" style headings
│   ├── SkillsSection.vue      ← mood board
│   ├── ExperienceSection.vue  ← side-by-side timelines
│   ├── TimelineColumn.vue
│   ├── TimelineItem.vue
│   ├── ProjectsSection.vue / ProjectCard.vue
│   ├── ServicesSection.vue / ServiceCard.vue
│   ├── ContactSection.vue
│   ├── NetworkBackground.vue  ← animated canvas background
│   ├── ThemeToggle.vue
│   ├── TagList.vue
│   └── BaseIcon.vue           ← SVG icon set
├── composables/useTheme.js    ← dark/light state
├── directives/reveal.js       ← v-reveal fade-in on scroll
└── utils/dates.js             ← month formatting and durations
```

## Deployment

Deployment is done manually from the [`rvgate/infrastructure`](https://github.com/rvgate/infrastructure)
repository (Ansible), the same way as `carambolecomputer-api`:

1. Push the changes to the **`live`** branch (`git push origin master:live`).
2. In the infrastructure repository, run `make rvgate`.
3. The `rvgate` role pulls the `live` branch onto the server, builds the `rvgate-nl` Docker
   image (`Dockerfile`: Node build → nginx) and runs `docker-compose.yaml`.
4. The nginx-proxy ingress picks the container up via `VIRTUAL_HOST` and serves it on
   https://rvgate.nl and https://www.rvgate.nl using the existing Let's Encrypt certificate.

Local Docker test:

```sh
make docker/build
make docker/run   # http://localhost:8080
```
