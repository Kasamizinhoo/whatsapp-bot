const venom = require('venom-bot');
const fs = require('fs');

venom.create({ session: 'Pagnan' })
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
      handler: "administrativo", // nome do departamento
    },
    {
      number: 2,
      title: "Departamento Fiscal",
      description: "Cumpra todas as obrigações tributárias com eficiência e segurança.",
      handler: "fiscal", // nome do departamento
    },
    {
      number: 3,
      title: "Departamento Pessoal",
      description: "Gerencie sua equipe de forma eficiente e esteja em conformidade com a legislação trabalhista.",
      handler: "pessoal", // nome do departamento
    },
    {
      number: 4,
      title: "Departamento Contábil",
      description: "Tenha uma contabilidade sólida e precisa para tomar decisões estratégicas.",
      handler: "contabil", // nome do departamento
    },
  ];

  const atendentes = {
    administrativo: ["Susana", "Silvete"],
    fiscal: ["Paula", "Ana Luiza"],
    pessoal: ["Livia", "Ana Rosa"],
    contabil: ["Paula", "Ana Gilza"]
  }

  let state = {};

  function validateInput(input) {
    if (isNaN(input)) {
      return false;
    }

    const numInput = parseInt(input);

    if (numInput < 1 || numInput > menu.length) {
      return false;
    }

    return true;
  }

  client.onMessage(async (message) => {
    if (!state[message.from]) {
      state[message.from] = {
        listaEnviada: false,
        transferido: false,
        departamento: null,
      };
    }

    const currentState = state[message.from];

    if (currentState.transferido) {
      const transferMessage = `Você foi transferido para o setor correspondente. Aguarde até ser atendido.`;
      if (message.body.toUpperCase() === "LISTA") {
        currentState.transferido = false;
        currentState.departamento = null;
        sendMenu(message.from);
      } else {
        client
          .sendText(message.from, transferMessage)
          .then((result) => {
            console.log('Resultado: ', result);
          })
          .catch((error) => {
            console.error('Erro ao enviar a mensagem: ', error);
          });
      }
    }
    else if (!currentState.listaEnviada || validateInput(message.body)) {
      if (!currentState.listaEnviada) {
        sendMenu(message.from);
        currentState.listaEnviada = true;
      } else {
        if (validateInput(message.body)) {
          const selectedOption = parseInt(message.body);
          const option = menu.find((item) => item.number === selectedOption);

          if (!currentState.transferido) {
            const department = option.handler;
            const atendenteList = atendentes[department];
            const randomIndex = Math.floor(Math.random() * atendenteList.length);
            const atendente = atendenteList[randomIndex];

            const response = `Você selecionou a opção ${option.number}. ${option.title}.
Aguarde um momento, ${atendente}, responsável pelo departamento, irá responder em breve.`;

            client
              .sendText(message.from, response)
              .then((result) => {
                console.log('Resultado: ', result);
                currentState.transferido = true;
                currentState.departamento = department;
              })
              .catch((error) => {
                console.error('Erro ao enviar a mensagem: ', error);
              });
          }
        } else {
          // Resposta em caso de mensagem inválida (não numérica)
          const invalidMessageResponse = `Por favor, escolha um número da lista (1, 2, 3, 4) para ser atendido pelo setor correspondente.`;
          client.sendText(message.from, invalidMessageResponse);
        }
      }
    }
  });

  function sendMenu(destination) {
    const resposta = `Bem-vindo(a) à Pagnan Contabilidade - sua parceira contábil completa!
Estamos aqui para ajudar em todas as suas necessidades empresariais.
Escolha um dos nossos serviços especializados:

${menu.map((item) => `${item.number}. ${item.title}: ${item.description}`).join("\n")}`;

    client
      .sendText(destination, resposta)
      .then((result) => {
        console.log('Resultado: ', result);
      })
      .catch((error) => {
        console.error('Erro ao enviar a mensagem: ', error);
      });
  }

  setTimeout(() => {
    console.log('Pressione qualquer tecla para sair...');
  }, 15000);
}
