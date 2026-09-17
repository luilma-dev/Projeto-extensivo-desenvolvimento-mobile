# Apresentação do TruckFlow — quatro integrantes

Duração sugerida: 7 a 10 minutos, com aproximadamente 2 minutos para cada integrante. Ensaiem usando o mesmo celular que será usado na apresentação.

## Visão geral do projeto

O TruckFlow é um aplicativo acadêmico para organizar uma oficina de caminhões. O fluxo atual possui:

- Login administrativo.
- Cadastro, busca e exclusão de veículos.
- Abertura e acompanhamento de ordens de serviço.
- Registro do valor cobrado e do custo de cada ordem.
- Cálculo automático do lucro de cada serviço.
- Resumo com faturamento, custos e lucro das ordens concluídas.

Os dados são fictícios e ficam apenas na memória do aplicativo. Ao recarregar ou reiniciar, os exemplos iniciais são restaurados.

## 1. Integrante 1 — problema, introdução e login

Telas: Login e Início.

Fala sugerida:

“O TruckFlow é um aplicativo criado para organizar os serviços de uma oficina de caminhões. O acesso começa por uma tela de login administrativo. Depois do login, o usuário pode controlar a frota, acompanhar ordens de serviço e consultar o resultado financeiro da oficina. O projeto foi desenvolvido com React Native e Expo.”

### Demonstração do login

1. Mostre a tela com a mensagem completa “Entre para gerenciar sua oficina”.
2. Tente entrar deixando um campo vazio e mostre a validação.
3. Informe uma credencial incorreta e mostre a mensagem “E-mail ou senha incorretos”.
4. Entre com o único acesso válido:
   - E-mail: `admin@gmail.com`
   - Senha: `123456`
5. Mostre que a senha fica escondida durante a digitação.
6. Explique que as telas internas e a navegação só aparecem depois do login.

Código para conhecer: `src/screens/LoginScreen.tsx`, o estado `isAuthenticated` e a função `logout` em `App.tsx`. Para esta demonstração, as credenciais são verificadas localmente e não existe servidor de autenticação.

Conceitos para entender: `useState` guarda e atualiza os valores dos campos; uma condição no `App.tsx` decide se a tela exibida será o login ou o conteúdo principal; o e-mail é normalizado para letras minúsculas antes da comparação.

## 2. Integrante 2 — frota e componentes da interface

Tela: Frota.

Fala sugerida:

“Depois do login, podemos cadastrar os veículos atendidos pela oficina. Cada veículo possui placa, modelo e nome do cliente. Também podemos pesquisar um veículo ou removê-lo com uma confirmação de segurança.”

### Demonstração da frota

1. Abra a aba Frota.
2. Toque em Cadastrar veículo.
3. Preencha a placa `KLM2N34`, o modelo `Volvo FH 460` e o cliente `Oficina Escola`.
4. Salve o cadastro e pesquise por `KLM2N34`.
5. Mostre que o aplicativo verifica campos obrigatórios, formato da placa e placas repetidas.
6. Explique que a exclusão de um veículo pede confirmação e também remove as ordens ligadas a ele.

Código para conhecer: `src/screens/FleetScreen.tsx` e as funções `addVehicle` e `removeVehicle` em `App.tsx`.

Componentes importantes:

- `TextInput` recebe os dados digitados.
- `Pressable` cria ações de toque.
- `View` organiza os elementos da interface.
- `Text` exibe títulos e informações.
- `FormModal` apresenta os formulários em uma tela sobreposta.

## 3. Integrante 3 — ordens, valores e lucro individual

Tela: Ordens.

Fala sugerida:

“Cada ordem de serviço liga um veículo a um trabalho da oficina. Além da descrição, registramos o valor cobrado do cliente e o custo que a oficina teve. A diferença entre esses dois valores é o lucro da ordem, calculado automaticamente.”

### Demonstração da ordem de serviço

1. Toque em Nova ordem de serviço.
2. Selecione o veículo `KLM2N34`.
3. Informe o serviço `Revisão preventiva`.
4. Preencha o valor cobrado, por exemplo `1.500,00`.
5. Preencha o custo do serviço, por exemplo `850,00`.
6. Mostre o lucro previsto de `R$ 650,00` antes de criar a ordem.
7. Crie a ordem e mostre no cartão:
   - Total da OS.
   - Custo.
   - Lucro.
   - Status atual.
8. Toque em Iniciar serviço para mudar de Aberta para Em andamento.
9. Toque em Concluir serviço para mudar de Em andamento para Concluída.
10. Mostre que uma ordem também pode ser excluída com confirmação.

### Regras financeiras da ordem

- O valor cobrado precisa ser maior que zero.
- O custo pode ser zero, mas não pode ser negativo.
- O formulário aceita valores no formato brasileiro, como `1.500,00`.
- O lucro é calculado por `valor cobrado - custo`.
- Se o custo for maior que o valor cobrado, o resultado negativo aparece em vermelho para indicar prejuízo.
- Os valores são guardados internamente em centavos para evitar erros de arredondamento.

Código para conhecer: `src/screens/OrdersScreen.tsx`, o tipo `Order` e a função `formatBRL` em `src/data.ts`, além das funções `addOrder`, `advanceOrder` e `removeOrder` em `App.tsx`.

## 4. Integrante 4 — resumo financeiro, organização e encerramento

Tela: Início, depois de concluir a ordem criada na demonstração.

Fala sugerida:

“Ao concluir uma ordem, seus valores entram automaticamente no resumo geral. O aplicativo soma o valor cobrado para calcular o faturamento, soma os custos e mostra o lucro realizado. Ordens abertas ou em andamento ainda não entram nesse resultado porque o serviço não foi finalizado.”

### Demonstração do resumo

1. Volte para a aba Início.
2. Mostre a quantidade de veículos e de serviços pendentes.
3. Mostre o cartão de Lucro realizado.
4. Explique os três resultados:
   - Faturamento: soma dos valores cobrados nas ordens concluídas.
   - Custos: soma dos custos das ordens concluídas.
   - Lucro: faturamento menos custos.
5. Mostre que os serviços pendentes também exibem o total de cada OS, mas ainda não entram no lucro realizado.
6. Toque em Sair da conta e mostre o retorno à tela de login.

Código para conhecer: `src/screens/HomeScreen.tsx`. Os cálculos usam `filter` para selecionar somente as ordens concluídas e `reduce` para somar faturamento e custos.

Mostre rapidamente a organização dos arquivos:

| Arquivo | Responsabilidade |
| --- | --- |
| `App.tsx` | Controla login, abas e dados compartilhados. |
| `src/screens/LoginScreen.tsx` | Campos, validação e acesso administrativo. |
| `src/screens/HomeScreen.tsx` | Resumo geral e resultados financeiros. |
| `src/screens/FleetScreen.tsx` | Cadastro, busca e exclusão de veículos. |
| `src/screens/OrdersScreen.tsx` | Criação, valores e andamento das ordens. |
| `src/data.ts` | Tipos, exemplos iniciais e formatação monetária. |
| `src/components.tsx` | Botões, campos, status e modal reutilizáveis. |
| `src/styles.ts` | Cores, tamanhos, espaçamentos e estilos do login. |

Fechamento sugerido:

“O TruckFlow agora cobre o fluxo desde o login e cadastro do veículo até a conclusão e análise financeira da ordem de serviço. Como evolução futura, os dados e a autenticação poderiam ser armazenados em um banco de dados seguro.”

## Como o cálculo funciona

Exemplo de uma ordem:

| Informação | Valor |
| --- | ---: |
| Valor cobrado | R$ 1.500,00 |
| Custo | R$ 850,00 |
| Lucro | R$ 650,00 |

Se existirem duas ordens concluídas, o resumo soma os valores das duas. Uma ordem que ainda estiver Aberta ou Em andamento continua visível, mas só será contabilizada quando mudar para Concluída.

## Perguntas que podem aparecer

- **Qual é o login?** O único acesso de demonstração é `admin@gmail.com`, com senha `123456`.
- **O login é seguro para produção?** Não. Ele é local e foi feito para demonstração acadêmica. Em produção, seria necessário um servidor, senhas protegidas e gerenciamento de sessão.
- **Como o lucro é calculado?** O aplicativo subtrai o custo do valor cobrado em cada ordem.
- **Por que ordens pendentes não entram no resumo?** Porque o resumo apresenta apenas valores realizados, ou seja, serviços concluídos.
- **Por que os valores ficam em centavos?** Para evitar imprecisões de números decimais durante os cálculos.
- **Por que não existe banco de dados?** O foco do exercício é interface, componentes e estado. Os dados em memória são suficientes para a demonstração.
- **O que acontece ao fechar ou recarregar?** O usuário volta para o login e os veículos e ordens retornam aos exemplos iniciais.
- **Como as telas conversam?** O `App.tsx` guarda os dados e passa informações e funções para as telas por propriedades, chamadas props.
- **Por que SDK 57?** O SDK precisa ser compatível com a versão instalada do Expo Go. A versão do SDK e a versão do aplicativo são coisas diferentes.
- **Vocês usaram IA?** Respondam com honestidade: “Usamos IA como apoio na construção e simplificação. Estudamos o fluxo e estamos aprendendo os componentes.”

## Ensaio antes da aula

- Execute `npm run start:clear` e abra o QR no celular com antecedência.
- Confirme a compatibilidade do Expo Go com SDK 57 e a conexão na mesma rede.
- Teste uma credencial incorreta e depois faça o login correto.
- Cadastre o veículo usado no roteiro.
- Crie, inicie e conclua uma ordem com valor e custo.
- Confira se o resumo financeiro mudou depois da conclusão.
- Teste o botão Sair da conta.
- Recarregue antes da apresentação para restaurar os três veículos e as três ordens iniciais.
- Mantenha o servidor rodando e o computador acordado.
- Deixe um vídeo curto da demonstração como reserva caso a rede da sala falhe.
