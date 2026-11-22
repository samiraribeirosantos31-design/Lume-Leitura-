# Continuidade do Lume Leitura

Esta ramificação parte do commit e9ee988 e integra o conteúdo de
www/Lume-Leitura-novidades.zip, preparado no fluxo com Claude.
O ZIP original é preservado. A versão principal não foi reescrita.

## Estrutura preservada

- JavaScript clássico, na ordem de www/index.html.
- Estado local na chave lume-leitura-v1. Não renomear essa chave.
- O tema padrão é lilás. A aparência é salva pelo botão em Ajustes. Perfis com avatar humano passam para a coruja.
- O modo visitante permanece local. O fluxo de conta exige configuração da equipe para ser ativado.
- docs/index.html continua sendo a página de download.
- docs/teste é a cópia da interface para GitHub Pages (main, pasta /docs).
  Ao editar www, sincronizar com: python3 scripts/sincronizar-web.py
- Não foi adicionado o workflow pages.yml do ZIP: ele publicaria www na raiz
  e substituiria a página de download existente.

## Novo recurso de atualização

- www/atualizacao.js: módulo isolado, sem substituir render, save ou o estado S.
- www/build-info.js: identificação local; o Actions sobrescreve apenas na
  área de trabalho da construção Android, usando o número da execução.
- Consulta API pública de Releases do GitHub: timeout de 8 segundos
  e intervalo automático de 6 horas. Há verificação manual em Ajustes.
- Só anuncia releases com APK, marcador válido e número maior.
- Há aviso dentro do app. A notificação Android requer permissão,
  solicitada em Ativar avisos. O toque abre a página oficial de download.
- Verifica ao abrir, voltar ao app ou recuperar a conexão.
  Não há push ou verificação com o app totalmente fechado.
- Não funciona retroativamente em APKs anteriores a esta implementação.
  É preciso instalar primeiro uma versão que inclua o verificador.
- O Actions escreve LUME_BUILD_CODE e LUME_VERSION na descrição da release.
  Preservar esses marcadores ao editar manualmente a descrição.

## Construção e assinatura

- Plugins Capacitor 6 Browser e Local Notifications no package.json.
- scripts/icones.sh está no caminho esperado.
- scripts/versao-build.py define versão e metadados da release.
- scripts/versao-android.py grava versionCode/versionName e permissão Android.
- Release só é publicada em main. PRs geram artefato, sem publicar.
- O workflow tenta preservar a chave de depuração com cache. Isso não recupera
  a assinatura dos APKs antigos, nem substitui uma chave de assinatura durável.
  Se a assinatura não coincidir, não desinstalar sem backup.
  Uma política de assinatura permanente deve ser tratada com a responsável.

## Validação e continuidade

Executar: node --test tests/integracao.cjs

Os testes cobrem os módulos em conjunto, o tema inicial, os mascotes, a migração
dos dados antigos, a estante com resposta simulada do Google Livros, o modo
offline, o isolamento dos perfis, conflitos e notificações de versão.

Antes de integrar, compare main novamente. A responsável pode ter enviado
novos arquivos pelo Claude. Teste o APK num Android em primeira instalação e
também atualizando um aparelho que já tem livros e notas.

## Ativação pela equipe

- No Google Cloud da equipe, ative a Books API e crie uma chave de cliente
  restrita à API e às aplicações autorizadas. Preencha LUME_GOOGLE_BOOKS_KEY em
  www/nuvem-config.js. Valide consulta, capas e importação no APK e na web.
  A chave de cliente é pública. O cadastro manual funciona sem internet.
- Crie ou selecione o projeto Firebase da equipe. Registre um app Web e copie
  apiKey, authDomain, projectId e appId para NUVEM em www/nuvem-config.js.
- Em Authentication, ative E-mail/senha. Em Firestore, crie o banco e publique
  firestore.rules no projeto da equipe. Cada conta só acessa seu documento.
- Para a versão web, autorize o domínio em Authentication. Ative Google para
  usar google:true. Para Facebook, configure o provedor e o endereço de
  retorno no Meta for Developers antes de usar facebook:true. Guarde o
  segredo do Facebook no console do Firebase.
- O login social no APK precisa de um fluxo nativo próprio e credenciais da
  assinatura de distribuição. Os botões sociais desta proposta são para web.
  Antes de publicar, valide também e-mail/senha no WebView do APK.
- O perfil visitante continua em lume-leitura-v1. O perfil da conta usa a
  mesma base, com o UID no final. Para transferir o progresso local, exporte
  um backup antes de entrar e restaure na conta de destino, se desejar
  substituir seus dados. Em conflito entre aparelhos, preserve ambos os
  backups antes de escolher uma versão.
- Rode python3 scripts/sincronizar-web.py após alterar a configuração.
  Valide login, logout, troca de conta, recuperação de senha e restauração
  em outro aparelho antes de anunciar suporte à nuvem.

## Quadro para a equipe e o Claude

- Kanban: https://lume-leitura-kanban.natanaelribeir884401.chatgpt.site
- Referência em JSON: https://lume-leitura-kanban.natanaelribeir884401.chatgpt.site/kanban.json

Use o quadro como referência de prioridades e a proposta no GitHub como
referência do código em revisão. O quadro tem acesso público de leitura.

## Segunda revisão

- A busca usa o Google Livros e recorre à Open Library quando o catálogo
  principal falha ou não retorna resultados. Sem internet, consulta os
  livros já salvos no aparelho. O resumo da Open Library é carregado sob
  demanda e guardado no registro quando disponível.
- A estante organiza capas por Lendo, Quero ler e Concluídos. Os detalhes
  mostram a ficha do livro e as páginas, com acesso ao registro de leitura.
  Capas baixadas e compatíveis são mantidas em cache local separado dos dados.
- O perfil carregado anteriormente pode reabrir offline. O app guarda alterações
  imediatamente, volta a tentar sincronizar quando recupera a conexão ou volta
  à tela e protege dados de revisões concorrentes.
- Login entre aparelhos ainda depende do projeto Firebase da equipe. Configure
  NUVEM e publique as regras antes da validação de contas reais.
- Novo projeto Cloudflare Pages da equipe: lume-leitura-kanban.pages.dev.
  A publicação de dados do quadro depende da configuração de acesso privado.
