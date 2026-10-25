# Guia Rápido: O Que Cada Integrante Implementou e Para Que Serve (Sprint 3)

Este documento resume de forma simples, direta e padronizada tudo o que cada integrante fez no **TruckFlow** (Sprint 3) e para que serve cada parte.

---

## 1. Cauê — AsyncStorage (Persistência Chave-Valor e Sessão)
* **Arquivos:** `src/storage/preferences.ts` e `src/screens/LoginScreen.tsx`
* **O que é:** Armazenamento interno simples do celular para salvar textos e configurações leves no formato chave-valor (JSON).
* **Para que serve no app:**
  * **Salvar a sessão (`@truckflow:session`):** Lembra o e-mail logado e a data do login para que o usuário não precise digitar e-mail e senha toda vez que abrir o aplicativo.
  * **Salvar a navegação (`@truckflow:lastTab`):** Lembra qual foi a última aba aberta (`Início`, `Frota` ou `Ordens`) e reabre diretamente nela.
  * **Salvar o histórico de rede (`@truckflow:lastSync`):** Guarda a data e hora exatas da última sincronização concluída com o servidor.
  * **Cache offline (`@truckflow:fipeBrands`):** Salva a lista de montadoras de caminhões da Tabela FIPE para que o usuário possa consultar mesmo sem sinal de internet.

---

## 2. Cauã — SQLite / `expo-sqlite` (Banco de Dados Relacional Embarcado)
* **Arquivos:** `src/storage/database.ts`, `src/storage/database.web.ts` e `src/data.ts`
* **O que é:** Um banco de dados relacional completo (com tabelas, linhas, colunas e chaves) instalado fisicamente dentro do próprio celular (`truckflow.db`).
* **Para que serve no app:**
  * **Tabela de Veículos (`vehicles`):** Grava placa, modelo e cliente de forma permanente na memória física do aparelho.
  * **Tabela de Ordens (`orders`):** Grava descrição do serviço, valor cobrado e custo em centavos (`total_cents`, `cost_cents`), lucro calculado e status (`Aberta`, `Em andamento`, `Concluída`).
  * **Integridade Referencial (`FOREIGN KEY`):** Cada ordem de serviço é amarrada a um veículo pela chave estrangeira `vehicle_id`. Se um veículo for excluído, todas as suas ordens vinculadas são apagadas juntas automaticamente.
  * **Transações Atômicas (`withTransactionAsync`):** Garante que o cadastro do dado e o registro na fila `sync_queue` aconteçam juntos. Se der qualquer erro, o banco desfaz tudo (*rollback*) para não corromper os dados.

---

## 3. Alexandre — Consumo de APIs REST via HTTPS e Tabela FIPE
* **Arquivos:** `src/api/client.ts`, `src/api/fipe.ts`, `src/FipePicker.tsx` e `src/screens/FleetScreen.tsx`
* **O que é:** Módulo de conexão HTTP/HTTPS (usando Fetch API nativa + `AbortController`) que faz requisições seguras a servidores remotos na internet.
* **Para que serve no app:**
  * **Consulta HTTPS de Montadoras (`GET`):** Busca a lista oficial de marcas de caminhões em `https://parallelum.com.br/fipe/api/v1/caminhoes/marcas`.
  * **Consulta HTTPS de Modelos (`GET`):** Busca os modelos reais da marca escolhida em `https://parallelum.com.br/fipe/api/v1/caminhoes/marcas/{codigo}/modelos` (Scania, Volvo, Mercedes-Benz, etc.) e preenche o cadastro automaticamente.
  * **Feedback Visual (`ActivityIndicator`):** Enquanto os dados são baixados via HTTPS, exibe um círculo giratório na tela com o texto *"Consultando a Tabela FIPE..."*, avisando ao usuário que a requisição está carregando.
  * **Controle de Timeout (`AbortController` - 10s) e `ApiError`:** Se a internet estiver lenta ou cair, cancela a requisição após 10 segundos para o app não travar e usa o cache local salvo no AsyncStorage.

---

## 4. Vinícius — Arquitetura Offline-First, NetInfo e Sincronização Outbox
* **Arquivos:** `src/api/sync.ts`, `App.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/OrdersScreen.tsx` e `docs/`
* **O que é:** Arquitetura desenhada para o aplicativo funcionar 100% sem internet e sincronizar sozinho quando o sinal voltar.
* **Para que serve no app:**
  * **Gravação Local Imediata:** Quando o usuário cadastra um caminhão ou cria uma ordem, a gravação ocorre no SQLite do celular primeiro, sem esperar a internet.
  * **Fila Outbox (`sync_queue`):** Cada alteração criada, atualizada ou removida gera um item pendente na tabela `sync_queue`.
  * **Detecção Automática de Rede (`NetInfo`):** Monitora o Wi-Fi e o 4G em tempo real. Se ficar sem sinal, exibe o aviso *"Modo offline · as alterações ficam salvas no aparelho"* com o contador de pendências.
  * **Envio Remoto (`POST` HTTPS):** Quando há conexão, envia os itens da fila para `https://jsonplaceholder.typicode.com/posts`. Cada item só sai da fila depois que o servidor confirma o recebimento (`201 Created`).

---

## 5. Os 3 Diagramas Técnicos

### • Diagrama 1: Arquitetura Geral (Offline-First)
* **O que mostra:** O mapa completo dos módulos do aplicativo e como eles conversam entre si.
* **Para que serve:** Demonstrar como as telas em React Native se conectam ao SQLite local, ao AsyncStorage, ao NetInfo e às APIs HTTPS na internet.

### • Diagrama 2: Fluxo de Sincronização (Sequência)
* **O que mostra:** A ordem exata dos passos executados pelo código quando o usuário clica em salvar.
* **Para que serve:** Comprovar o funcionamento offline-first: 1º grava no SQLite local, 2º atualiza a tela na hora, 3º verifica se há internet e 4º envia via `POST` HTTPS para o servidor remoto.

### • Diagrama 3: Modelo de Dados (Diagrama ER)
* **O que mostra:** A estrutura das três tabelas do banco SQLite (`vehicles`, `orders` e `sync_queue`), suas colunas e a chave estrangeira `vehicle_id`.
* **Para que serve:** Comprovar a modelagem relacional do banco embarcado no celular.
