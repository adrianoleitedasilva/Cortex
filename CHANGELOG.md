# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

## [0.1.0] - 2026-08

Primeira versão do Cortex — MVP completo.

### Editor

- Editor Markdown nativo com CodeMirror 6
- Live Preview: sintaxe markdown oculta/revelada conforme a posição do cursor (headings, negrito, itálico, código inline, citações)
- Highlight de sintaxe para markdown/GFM (tabelas, riscado, listas de tarefas), com highlight de linguagem nos blocos de código
- Links internos `[[nota]]`, com resolução por nome, decoração visual (link válido vs. quebrado), autocomplete e criação automática da nota ao clicar num link quebrado
- Tags `#tag` (com suporte a aninhamento `#a/b`), com decoração visual e autocomplete
- Checkboxes de tarefa interativos, clicáveis direto no editor
- Colar e arrastar imagens/arquivos para o editor, com widget de imagem inline
- Ícones do Font Awesome atribuíveis a notas/pastas (árvore e abas) e inseríveis inline no texto via `:nome-do-icone:`, com autocomplete
- Autosave com debounce, undo/redo, atalhos de formatação (Ctrl+B, Ctrl+I, Ctrl+K)
- Contagem de linhas, palavras e caracteres da nota ativa, exibida na barra de status

### Gestão de notas

- Criar, renomear, mover e excluir notas e pastas, incluindo drag & drop na árvore de arquivos
- Menu de contexto nativo do Windows na árvore de arquivos
- Favoritos e notas recentes, persistidos entre sessões
- Busca full-text (com snippet de contexto) e busca por tag
- Backlinks e detecção de links quebrados, com painel dedicado que atualiza automaticamente
- Quick Switcher (Ctrl+O) para navegação rápida entre notas via fuzzy search

### Vault

- Seleção/criação de vault via diálogo nativo, com detecção automática de mudanças externas nos arquivos (chokidar)
- Suporte a múltiplos vaults com histórico de recentes e troca rápida
- Índice de notas, tags e backlinks mantido em memória e atualizado ao vivo

### Aparência e configurações

- Tema Light/Dark
- Seleção de fonte (JetBrains Mono, Fira Code, monoespaçada do sistema, Inter, Georgia) e tamanho
- Modal de Configurações com abas: Aparência, Privacidade, Vault, Atalhos
- Toggle de imagens remotas (bloqueadas por padrão via CSP, dinâmica via header no processo main)
- Menu nativo do Windows: Arquivo, Editar, Visualizar, Configurações, Sobre
- Atalhos de criação contextual: nova nota/pasta na pasta selecionada (Ctrl+N / Ctrl+Shift+N) e nota rápida sempre na raiz do vault (Ctrl+Alt+N)
- Sistema de ícones outline/solid (crossfade no hover) para toda a interface

### Segurança

- `contextIsolation` habilitado, API exposta via `contextBridge` com superfície restrita
- Todo acesso a arquivo validado contra tentativa de escapar do vault
- Protocolo customizado `cortex-attachment://` para servir imagens/anexos com validação de caminho
- CSP estrita, com bloqueio de imagens remotas por padrão
