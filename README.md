# TruckFlow 3.0.0

Aplicativo acadêmico de oficina de caminhões feito com React Native e Expo SDK 57. Três telas: Início, Frota e Ordens.

**Sprint 3:** persistência local (AsyncStorage + SQLite), consumo de APIs REST (Tabela FIPE + sincronização) e arquitetura offline-first. Detalhes técnicos e diagramas em [`docs/RELATORIO_ITEM3.md`](docs/RELATORIO_ITEM3.md).

O acesso de demonstração usa o e-mail `admin@gmail.com` e a senha `123456`.

## Abrir no celular

1. Use Node.js 22.13 ou superior (aqui foi usado Node 24).
2. Abra um terminal na pasta do projeto e execute `npm install`.
3. Execute `npm run start:clear`.
4. Conecte computador e celular à mesma rede Wi-Fi.
5. Abra com o Expo Go compatível com SDK 57: no Android, use o leitor de QR do Expo Go; no iPhone, a câmera.

Se aparecer incompatibilidade, confira se o Expo Go instalado suporta SDK 57 e se o QR é deste projeto, não de um servidor antigo. Feche o servidor antigo com Ctrl+C e repita o passo 3. Limpar cache sozinho não atualiza o Expo Go. Referência: https://docs.expo.dev/versions/v57.0.0/

Para testar no navegador: `npm run web`. Para conferir os tipos: `npm run typecheck`.

## Gerar APK para Android

O projeto está vinculado ao EAS Build e possui o perfil `apk` em `eas.json`. Para solicitar uma nova compilação instalável, entre na conta Expo configurada e execute:

```bash
npm run build:apk
```

O EAS exibe um link para acompanhar e baixar o arquivo `.apk` quando a compilação terminar. Esse formato pode ser instalado diretamente no Android; para publicação na Play Store, o formato recomendado é `.aab`.

## O que demonstrar

- Início: quantidade de veículos, serviços pendentes, faturamento, custos, lucro e card de **Sincronização** (online/offline, pendências, última sincronização, botão com indicador de carregamento).
- Frota: cadastrar e buscar por placa, modelo ou cliente. O botão **Buscar modelo na Tabela FIPE** consulta a API pública com indicador de carregamento.
- Ordens: selecionar veículo, descrever serviço, registrar valor cobrado e custo, conferir o lucro e avançar de Aberta para Em andamento e Concluída.
- Login: somente as credenciais administrativas de demonstração liberam o aplicativo. A sessão fica salva.

## Persistência e sincronização (Sprint 3)

- **SQLite** (`expo-sqlite`): veículos, ordens e a fila `sync_queue`. Os exemplos são inseridos apenas na primeira execução.
- **AsyncStorage**: sessão, última aba, data da última sincronização e cache das marcas FIPE.
- **Offline-first**: toda alteração é gravada no aparelho e entra na fila. Com internet, a fila é enviada por `POST` para `API_URL` (`src/api/sync.ts`, hoje o servidor de testes JSONPlaceholder). Sem internet, aparece o banner "Modo offline" e o envio acontece sozinho quando a conexão volta.
- No navegador (`npm run web`), o mesmo repositório usa `database.web.ts` sobre AsyncStorage; no celular, usa SQLite.

### Roteiro para gravar as evidências

1. Faça login, vá em **Frota** e cadastre um veículo usando **Buscar modelo na Tabela FIPE** (mostra o indicador de carregamento).
2. Feche o app totalmente (remova da multitarefa) e abra de novo: o login, a aba e o veículo continuam lá.
3. Ative o modo avião, crie uma ordem: aparece "Modo offline · 1 pendente(s)".
4. Desative o modo avião: o card **Sincronização** mostra "Enviando dados ao servidor..." e depois a confirmação.

> Para voltar aos dados de exemplo, apague os dados do Expo Go nas configurações do Android.

## Onde fica cada coisa

| Arquivo | Responsabilidade |
| --- | --- |
| `index.ts` | Registra o aplicativo no Expo. |
| `App.tsx` | Carrega os dados do banco, controla abas, rede e sincronização. |
| `src/data.ts` | Tipos e exemplos iniciais. |
| `src/storage/preferences.ts` | Persistência chave-valor (AsyncStorage). |
| `src/storage/database.ts` | Banco SQLite: tabelas, CRUD e fila de sincronização. |
| `src/storage/database.web.ts` | Mesma interface para o navegador. |
| `src/api/client.ts` | Cliente HTTP com tempo limite. |
| `src/api/fipe.ts` | Consulta à Tabela FIPE (GET). |
| `src/api/sync.ts` | Envio da fila ao servidor (POST). |
| `src/FipePicker.tsx` | Busca FIPE com indicador de carregamento. |
| `src/screens/LoginScreen.tsx` | Login administrativo local. |
| `src/screens/HomeScreen.tsx` | Resumo da oficina e status de sincronização. |
| `src/screens/FleetScreen.tsx` | Cadastro e busca de veículos. |
| `src/screens/OrdersScreen.tsx` | Abertura e andamento de serviços. |
| `src/components.tsx` | Botão, campo, status e formulário compartilhados. |
| `src/styles.ts` | Cores e estilos. |
| `app.json` | Nome, ícones e versão do aplicativo. |

Leia `APRESENTACAO.md` para o roteiro dividido entre quatro integrantes.

## Mudanças da versão 3.0.0 (Sprint 3)

Dados passam a ser gravados no aparelho (SQLite e AsyncStorage) e sobrevivem ao fechamento do app. Incluídos: sessão persistente, consulta à Tabela FIPE, fila de sincronização com envio por API REST, detecção de rede (NetInfo) e banner de modo offline.

## Mudanças da versão 2.1.0

A edição acadêmica substitui o sistema amplo anterior. Foram removidos Supabase, autenticação, permissões, módulo financeiro avançado, estoque, agenda, relatórios, portal do cliente, scanners, atualizações remotas e dependências associadas. O resumo mantém apenas o cálculo financeiro essencial das ordens. A identidade visual mantém logo, azul, fundo claro e cartões arredondados. A navegação usa estado do React, sem biblioteca de rotas.

Versão do app: 3.0.0. SDK: Expo 57. São números diferentes: um identifica a edição do TruckFlow; o outro, a base técnica compatível com Expo Go.
