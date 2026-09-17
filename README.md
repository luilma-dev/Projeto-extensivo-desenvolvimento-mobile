# TruckFlow 2.1.0

Aplicativo acadêmico de oficina de caminhões feito com React Native e Expo SDK 57. Três telas: Início, Frota e Ordens.

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

- Início: quantidade de veículos, serviços pendentes, faturamento, custos e lucro das ordens concluídas.
- Frota: cadastrar e buscar por placa, modelo ou cliente.
- Ordens: selecionar veículo, descrever serviço, registrar valor cobrado e custo, conferir o lucro e avançar de Aberta para Em andamento e Concluída.
- Login: somente as credenciais administrativas de demonstração liberam o aplicativo.

O login é uma demonstração local, sem servidor próprio ou banco de dados. Os dados são fictícios e ficam no `useState`. Trocar de aba mantém os dados; recarregar ou reiniciar o app restaura os exemplos e volta para o login. A conexão com o computador é necessária para carregar o projeto no Expo Go durante o desenvolvimento.

## Onde fica cada coisa

| Arquivo | Responsabilidade |
| --- | --- |
| `index.ts` | Registra o aplicativo no Expo. |
| `App.tsx` | Guarda os dados e controla as três abas. |
| `src/data.ts` | Tipos e exemplos iniciais. |
| `src/screens/LoginScreen.tsx` | Login administrativo local. |
| `src/screens/HomeScreen.tsx` | Resumo da oficina. |
| `src/screens/FleetScreen.tsx` | Cadastro e busca de veículos. |
| `src/screens/OrdersScreen.tsx` | Abertura e andamento de serviços. |
| `src/components.tsx` | Botão, campo, status e formulário compartilhados. |
| `src/styles.ts` | Cores e estilos. |
| `app.json` | Nome, ícones e versão do aplicativo. |

Leia `APRESENTACAO.md` para o roteiro dividido entre quatro integrantes.

## Mudanças da versão 2.1.0

A edição acadêmica substitui o sistema amplo anterior. Foram removidos Supabase, autenticação, permissões, módulo financeiro avançado, estoque, agenda, relatórios, portal do cliente, scanners, atualizações remotas e dependências associadas. O resumo mantém apenas o cálculo financeiro essencial das ordens. A identidade visual mantém logo, azul, fundo claro e cartões arredondados. A navegação usa estado do React, sem biblioteca de rotas.

Versão do app: 2.1.0. SDK: Expo 57. São números diferentes: um identifica a edição do TruckFlow; o outro, a base técnica compatível com Expo Go.
