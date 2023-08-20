const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

// Dados de conexão com o MongoDB
const uri = 'mongodb+srv://kasamizinho:jaque.teamo@bot-whats.1hqajc2.mongodb.net/?retryWrites=true&w=majority'; // Insira sua URI de conexão com o MongoDB aqui

// Carrega os dados dos clientes do arquivo JSON
const customersData = fs.readFileSync('customer_data.json', 'utf8');
const customers = JSON.parse(customersData);

// Função para importar os dados dos clientes para o MongoDB
async function importData() {
  try {
    // Conecta ao servidor MongoDB
    const client = await MongoClient.connect(uri);
    console.log('Conectado ao servidor MongoDB');

    // Cria um banco de dados
    const db = client.db('customers_db');

    // Verifica se a coleção já existe antes de criá-la
    async function createCollectionIfNotExists(collectionName) {
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`Coleção '${collectionName}' criada`);
      }
    }

    // Cria as coleções para cada departamento
    const departments = [...new Set(customers.map((customer) => customer.department))];
    for (const department of departments) {
      const sanitizedDepartment = department.replace(' ', '_');
      await createCollectionIfNotExists(sanitizedDepartment);
    }

    // Insere os clientes nas coleções correspondentes
    for (const customer of customers) {
      const { name, number, department } = customer;
      const sanitizedDepartment = department.replace(' ', '_');
      await db.collection(sanitizedDepartment).insertOne(customer);
      console.log(`Cliente '${name}' inserido na coleção '${sanitizedDepartment}'`);
    }

    // Fecha a conexão com o servidor MongoDB
    client.close();
    console.log('Conexão com o servidor MongoDB fechada');
  } catch (error) {
    console.error('Erro ao importar os dados para o MongoDB:', error);
  }
}

// Chama a função para importar os dados
importData();


setTimeout(() => {
  console.log('Pressione qualquer tecla para sair...');
}, 15000);