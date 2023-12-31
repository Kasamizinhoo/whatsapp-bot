const venom = require('venom-bot');
const fs = require('fs');

venom.create({ session: 'Gabriel' })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  const menu = [
    {
      number: 1,
      title: "Departamento Administrativo",
      description: "Organize e otimize suas operações comerciais.",
      handler: "Brenda" // nome da responsável pelo setor administrativo
    },
    {
      number: 2,
      title: "Departamento Fiscal",
      description: "Cumpra todas as obrigações tributárias com eficiência e segurança.",
      handler: "Livia" // nome da responsável pelo setor fiscal
    },
    {
      number: 3,
      title: "Departamento Pessoal",
      description: "Gerencie sua equipe de forma eficiente e esteja em conformidade com a legislação trabalhista.",
      handler: "Paula" // nome da responsável pelo setor pessoal
    },
    {
      number: 4,
      title: "Departamento Contábil",
      description: "Tenha uma contabilidade sólida e precisa para tomar decisões estratégicas.",
      handler: "Gustavo" // obvio
    },
    {
      number: 0,
      title: "Receber a lista novamente",
      description: "Caso queira receber a lista de opções novamente.",
      handler: "lista" // identificador para receber a lista novamente
    }
  ];

  let state = {}; // criando variável para armazenar os clientes já atendidos

  client.onMessage(async (message) => {
    const selectedOption = parseInt(message.body);

    if (!state[message.from]) {
      // Estado inicial para um novo cliente
      state[message.from] = {
        listaEnviada: false, // verifica se a lista já foi enviada
        transferido: false, // verifica se o cliente já foi transferido
        departamento: null, // departamento do cliente
        timeout: null, // timeout para restringir as mensagens do cliente
        stopMessaging: false // indica se o bot deve parar de enviar mensagens
      };
    }

    const currentState = state[message.from];

    if (currentState.stopMessaging) {
      return; // Não responder se o bot deve parar de enviar mensagens
    }

    if (!currentState.listaEnviada) {
      const resposta = `Bem-vindo(a) à Pagnan Contabilidade - sua parceira contábil completa!
Estamos aqui para ajudar em todas as suas necessidades empresariais.
Escolha um dos nossos serviços especializados:

${menu.map((item) => `${item.number}. ${item.title}: ${item.description}`).join("\n")}`;

      client
        .sendText(message.from, resposta)
        .then((result) => {
          console.log('Resultado: ', result);
          currentState.listaEnviada = true; // marca a lista como enviada
        })
        .catch((error) => {
          console.error('Erro ao enviar a mensagem: ', error);
        });
    } else if (currentState.transferido) {
      const transferMessage = `Você foi transferido para o setor correspondente. Aguarde até ser atendido.`;
      client
        .sendText(message.from, transferMessage)
        .then((result) => {
          console.log('Resultado: ', result);
          currentState.transferido = false; // reinicia o status de transferido
          clearTimeout(currentState.timeout); // limpa o timeout atual, se houver
          currentState.timeout = null; // reseta o timeout
          currentState.timeout = setTimeout(() => {
            currentState.timeout = null; // remove o timeout após 1 minuto
          }, 1 * 60 * 1000); // define o timeout para 1 minuto
        })
        .catch((error) => {
          console.error('Erro ao enviar a mensagem: ', error);
        });
    } else if (selectedOption >= 1 && selectedOption <= menu.length) {
      const option = menu.find((item) => item.number === selectedOption);

      if (option.handler === "lista") {
        currentState.listaEnviada = false; // marca a lista como não enviada
        currentState.transferido = false; // reseta o status de transferido
      } else {
        const handler = option.handler; // responsável pelo setor correspondente
        let handlerName;

        if (handler === "+556692198328@c.us") {
          handlerName = "Fabyla"; // nome do responsavel pelo setor contabil
        } else {
          handlerName = handler;
        }

        const response = `Você selecionou a opção ${option.number}. ${option.title}.
Aguarde um momento, ${handlerName}, responsável pelo departamento, irá responder em breve.`;

        // enviar mensagem de resposta ao cliente
        client
          .sendText(message.from, response)
          .then((result) => {
            console.log('Resultado: ', result);
            currentState.transferido = true; // marca o cliente como transferido
            currentState.departamento = option.title; // define o departamento do cliente
            clearTimeout(currentState.timeout); // limpa o timeout atual, se houver
            currentState.timeout = null; // reseta o timeout
            currentState.timeout = setTimeout(() => {
              currentState.timeout = null; // remove o timeout após 1 minuto
            }, 1 * 60 * 1000); // define o timeout para 1 minuto
          })
          .catch((error) => {
            console.error('Erro ao enviar a mensagem: ', error);
          });
      }
    }

    saveCustomerData(message.from, message.sender.pushname, currentState.departamento);
  });
}

function saveCustomerData(number, name, department) {
  const data = {
    name: name,
    number: number,
    department: department || "Aguardando atendimento"
  };

  fs.appendFile('customer_data.json', JSON.stringify(data) + "\n", (err) => {
    if (err) {
      console.error('Erro ao salvar os dados do cliente:', err);
    }
  });
}
