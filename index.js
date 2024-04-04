const amqp = require("amqplib");
require('dotenv').config();

const exchangeName = process.env.AMQP_EXCH;
const routingKey = process.env.AMQP_ROUTINGKEY2;
const options = {
  username: process.env.AMQP_USERNAME,
  password: process.env.AMQP_PASSWORD,
};
const queue = process.env.AMQP_QUEUE_USERNAME;

const consumer = async () => {
    console.log(process.env.AMQP_URL);
  try {
    const conn = await amqp.connect(process.env.AMQP_URL || 'amqp://54.147.21.63', options);
  const ch = await conn.createChannel();
  await ch.bindQueue(queue, exchangeName, routingKey);
  console.log(
    " [*] Esperando mensajes en la cola %s. Para salir, presiona CTRL+C",
    queue
  );

  await ch.consume(
    queue,
    async (msg) => {
      if (msg !== null) {
        const data = msg.content.toString();

        console.log(" [x] Recibido '%s'", data);
        const body = JSON.stringify({
          idPay: data.idPay,
          product: data.product,
          date: data.date,
          price: data.price,
        });
        console.log(body);
        ch.ack(msg);
      } else {
        console.error("El mensaje es nulo");
      }
    },
    { noAck: false }
  );
  } catch (error) {
    console.error(error);
  }
};

consumer();
