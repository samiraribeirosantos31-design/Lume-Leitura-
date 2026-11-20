# Continuidade do Lume Leitura

Esta ramificação parte do commit e9ee988 e integra o conteúdo de
www/Lume-Leitura-novidades.zip, preparado no fluxo com Claude.
O ZIP original é preservado. A versão principal não foi reescrita.

## Estrutura preservada

- JavaScript clássico, na ordem de www/index.html.
- Estado local na chave lume-leitura-v1. Não renomear essa chave.
- Lilás padrão, cores, mascotes, avatar e Google Livros vêm do pacote original.
- Firebase permanece sem configuração: login/sincronização não estão ativados.
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

Sete testes cobrem carregamento dos scripts, lilás/avatar, Google Livros
com resposta simulada, dados antigos, consulta de versões, notificação,
destino fixo do toque, intervalo e modo offline.

O navegador headless local não iniciou por restrição do ambiente. Ainda é
necessário testar visualmente e instalar o APK no Android, incluindo permissão
de notificações, toque, consulta real do Google Livros e atualização por cima.

Antes de integrar, comparar main novamente: a responsável pode ter enviado
novos arquivos pelo Claude. Não sobrescrever mudanças concorrentes.
