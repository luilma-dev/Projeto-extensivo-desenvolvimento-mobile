# Apresentação do TruckFlow (Sprint 3) — Quatro Integrantes (Cauê, Cauã, Alexandre e Vinícius)

Duração sugerida: 8 a 10 minutos (~2 minutos para cada integrante). Ensaiem usando o celular com o Expo Go ou a demonstração no navegador.

---

## Visão Geral do Projeto (Sprint 3)

O TruckFlow é um aplicativo desenvolvido na Fábrica de Software para organizar o fluxo operacional e financeiro de oficinas mecânicas de caminhões. Na **Sprint 3**, a equipe evoluiu o aplicativo de um protótipo visual em memória para uma aplicação móvel com engenharia de dados completa:
- **Persistência Chave-Valor (AsyncStorage):** retenção da sessão administrativa de login, da última aba ativa e cache offline de marcas.
- **Banco Relacional Embarcado (SQLite):** tabelas físicas não-voláteis de veículos, ordens de serviço e fila técnica de sincronização com transações ACID.
- **Consumo de APIs REST:** consulta em tempo real à Tabela FIPE oficial (leitura com indicador visual de carregamento) e envio à API remota (escrita).
- **Arquitetura Offline-First:** funcionamento 100% autônomo sem internet, padrão *Outbox* e sincronização automática transparente quando a conexão retorna.

---

## 1. Cauê — Introdução, Login Administrativo e AsyncStorage

**Telas:** Login e Início.  
**Módulos-chave:** `src/storage/preferences.ts` e `src/screens/LoginScreen.tsx`.

### Fala sugerida:
> *"Boa noite, professor e colegas. Nosso aplicativo é o TruckFlow, voltado para modernizar o controle operacional e financeiro de oficinas mecânicas de veículos pesados. Na Sprint 3, eu fiquei responsável pelo módulo de persistência local chave-valor utilizando o AsyncStorage e pelo gerenciamento da sessão do aplicativo.*
> *No protótipo anterior, os dados eram puramente voláteis e o login era perdido sempre que o aplicativo era fechado. Agora, implementamos o módulo `preferences.ts`. Quando o operador faz o login administrativo com email e senha, suas credenciais e timestamp são gravados fisicamente na memória não-volátil do celular.*
> *Além disso, o AsyncStorage guarda a última aba navegada e mantém o cache da Tabela FIPE para consultas offline.*
> *Vou demonstrar: ao acessar com `admin@gmail.com` e senha `123456`, o acesso é liberado. Se fecharmos o aplicativo e abrirmos novamente, a sessão é restaurada de imediato pelo AsyncStorage, sem forçar o usuário a digitar a senha novamente."*

### Demonstração prática:
1. Abra a tela de login.
2. Digite as credenciais de demonstração (`admin@gmail.com` / `123456`).
3. Mostre o acesso à tela principal e comprove que o login é lembrado após fechar e reabrir o app.

---

## 2. Cauã — Frota, Banco de Dados Embarcado (SQLite) e Transações

**Tela:** Frota.  
**Módulos-chave:** `src/storage/database.ts` e `src/screens/FleetScreen.tsx`.

### Fala sugerida:
> *"Eu fui responsável pelo módulo de banco de dados relacional embarcado utilizando o `expo-sqlite`. O SQLite roda diretamente dentro do dispositivo do mecânico, eliminando qualquer dependência de servidores para armazenar veículos e serviços.*
> *Modelamos três tabelas relacionais: `vehicles`, `orders` (com chave estrangeira `vehicle_id` e exclusão em cascata) e a tabela técnica `sync_queue`.*
> *Um ponto técnico crucial foi o uso de transações atômicas com `withTransactionAsync`. Toda vez que um veículo é cadastrado ou removido, a operação no banco de dados e o registro da alteração na fila de sincronização ocorrem dentro da mesma transação. Se houver qualquer falha, o banco realiza rollback automático, impedindo estados inconsistentes.*
> *Vou demonstrar cadastrando um veículo na frota: o registro é salvo fisicamente no arquivo `truckflow.db` e permanece no celular mesmo se o dispositivo for desligado."*

### Demonstração prática:
1. Navegue até a aba **Frota**.
2. Mostre os veículos listados do banco SQLite.
3. Cadastre um novo veículo e comprove que a lista atualiza instantaneamente a partir da tabela do SQLite.

---

## 3. Alexandre — Consumo de APIs REST (Tabela FIPE) e Feedback Visual

**Tela:** Modal de Novo Veículo (na aba Frota).  
**Módulos-chave:** `src/api/client.ts`, `src/api/fipe.ts` e `src/FipePicker.tsx`.

### Fala sugerida:
> *"Eu fiquei responsável pela integração com APIs REST externas e pelo feedback visual de carregamento.*
> *Integramos o cadastro de veículos à API REST pública da Tabela FIPE de caminhões pesados. Desenvolvemos um cliente HTTP próprio com `AbortController`, definindo um timeout de segurança de 10 segundos para impedir que o aplicativo fique travado caso a rede oscile.*
> *Ao tocar no botão 'Buscar modelo na Tabela FIPE', uma requisição GET é disparada e o aplicativo exibe em tempo real um indicador giratório (`ActivityIndicator`) com a mensagem 'Consultando a Tabela FIPE...'. Isso dá clareza ao usuário de que a rede está trabalhando.*
> *O operador seleciona a montadora (como Scania, Volvo ou Mercedes-Benz) e o modelo oficial, que são inseridos automaticamente no formulário. E caso o usuário esteja sem sinal, o sistema utiliza o cache salvo no AsyncStorage para listar as montadoras."*

### Demonstração prática:
1. Abra o cadastro de veículos na aba Frota.
2. Toque no botão "Buscar modelo na Tabela FIPE".
3. Aponte o indicador de carregamento giratório na tela.
4. Escolha uma montadora (ex: Scania) e selecione um modelo para ver os campos preenchidos automaticamente.

---

## 4. Vinícius — Ordens de Serviço, Arquitetura Offline-First e Sincronização

**Telas:** Ordens e Início.  
**Módulos-chave:** `src/api/sync.ts`, `App.tsx` (NetInfo) e `src/screens/HomeScreen.tsx`.

### Fala sugerida:
> *"Minha responsabilidade foi a gestão das ordens de serviço, a Arquitetura Offline-First e a sincronização com o servidor remoto.*
> *Primeiro, nas ordens de serviço, todos os valores financeiros são calculados e armazenados internamente em centavos como números inteiros. Isso elimina imprecisões de arredondamento de ponto flutuante em JavaScript e garante que faturamento, custos e lucro estejam sempre exatos.*
> *Segundo, em pátios ou galpões sem sinal de internet, o aplicativo opera no padrão Outbox: qualquer alteração entra no SQLite e na fila `sync_queue`. O `@react-native-community/netinfo` detecta a ausência de rede e exibe o banner 'Modo offline' com a contagem de itens pendentes.*
> *Assim que a internet retorna, o aplicativo despacha automaticamente a fila via requisições POST para o servidor. Cada item só é removido da fila local após o servidor confirmar com status 201 Created.*
> *Na tela Início, temos o card de Sincronização com o status Online e o resumo financeiro das ordens concluídas."*

### Demonstração prática:
1. Abra a aba **Ordens** e crie uma nova ordem de serviço com valor e custo, mostrando o lucro previsto.
2. Mostre o card de **Sincronização** na tela **Início** (badge Online, 0 pendências e horário do último envio).
3. Conclua uma ordem e mostre a atualização imediata no painel financeiro de **Lucro Realizado**.

---

## Perguntas Prováveis da Banca e do Professor

1. **"Por que utilizar AsyncStorage e SQLite no mesmo aplicativo?"**  
   *Resposta:* Princípio da responsabilidade única. O AsyncStorage é otimizado para pares chave-valor sem relacionamentos (sessão do usuário, última aba e cache leve). O SQLite é um banco ACID robusto para dados relacionais complexos, com integridade referencial, chaves estrangeiras e garantia transacional.

2. **"O que acontece se a internet falhar durante a sincronização?"**  
   *Resposta:* O padrão arquitetural Outbox protege os dados. Um item só é removido da tabela `sync_queue` após receber o código HTTP 201 Created do servidor. Se a conexão cair, a fila permanece salva no SQLite do aparelho e é reenviada na próxima tentativa.

3. **"Por que os valores monetários foram modelados em inteiros (centavos)?"**  
   *Resposta:* Em JavaScript, operações com números de ponto flutuante (`float`) sofrem com imprecisões binárias (ex: `0.1 + 0.2 = 0.30000000000000004`). Armazenar `totalCents` e `costCents` em inteiros elimina totalmente qualquer desvio em centavos nas operações financeiras da oficina.
