# Cortex

Um app de notas local-first em Markdown para Windows, com links internos, tags, Live Preview e busca full-text — inspirado em Obsidian e Notion.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

## Sobre

Suas notas são arquivos `.md` de verdade, guardados numa pasta ("vault") que você escolhe — nada de banco de dados proprietário. O Cortex funciona 100% offline e não depende de nenhum serviço externo.

## Funcionalidades

### Editor

- Markdown nativo com **Live Preview** (a sintaxe some/aparece conforme o cursor, como no Obsidian)
- Headings, negrito, itálico, código inline e em bloco (com highlight de sintaxe), listas, tabelas e citações
- Links internos `[[nota]]` — com autocomplete, navegação e criação automática da nota se ela não existir
- Tags `#tag` (incluindo aninhadas, tipo `#projeto/sub`) com autocomplete
- Checkboxes de tarefa interativos (`- [ ]`)
- Imagens e anexos: colar (Ctrl+V) ou arrastar arquivos direto pro editor
- Ícones personalizados do **Font Awesome** — atribua um ícone a qualquer nota/pasta (aparece na árvore e nas abas) ou insira ícones inline no texto com `:nome-do-icone:`
- Autosave, undo/redo, atalhos de formatação (Ctrl+B/I/K)
- Contagem de linhas, palavras e caracteres da nota ativa (barra de status)

### Gestão de notas

- Criar, renomear, mover (drag & drop) e excluir notas e pastas
- Pastas e subpastas
- Favoritos e notas recentes
- Busca full-text (com trecho de contexto) e busca por tag
- Backlinks e detecção de links quebrados, com painel dedicado
- Quick Switcher (Ctrl+O) para ir direto a qualquer nota

### Vault e configurações

- Múltiplos vaults, com troca rápida entre os recentes
- Tema Light/Dark
- Escolha de fonte (monoespaçadas e de prosa) e tamanho
- Toggle de privacidade para imagens remotas (bloqueadas por padrão)
- Menu nativo do Windows (Arquivo / Editar / Visualizar / Configurações / Sobre)

## Tecnologias

- **Electron** + **electron-vite** — app desktop multiplataforma
- **React** + **TypeScript** — interface
- **CodeMirror 6** — editor de texto e todo o sistema de Live Preview (plugins próprios)
- **Zustand** — estado da aplicação
- **minisearch** — busca full-text
- **fuzzysort** — Quick Switcher
- **chokidar** — observação de mudanças no vault em tempo real
- **Font Awesome Free** — ícones personalizáveis

## Desenvolvimento

```bash
npm install
npm run dev
```

O app abre em modo desenvolvimento com hot-reload. Build de produção:

```bash
npm run build
```

## Licença de ícones

Os ícones personalizáveis usam o [Font Awesome Free](https://fontawesome.com), licenciado sob CC BY 4.0.
