const amqp = require("amqplib");
require("dotenv").config();

const exchangeName = process.env.AMQP_EXCH;
const options = {
  username: process.env.AMQP_USERNAME,
  password: process.env.AMQP_PASSWORD,
};

const consumer = async () => {
  const queue = process.env.AMQP_QUEUE_PASSWORD;
  const routingKey = process.env.AMQP_ROUTINGKEY;
  try {
    const conn = await amqp.connect(
      process.env.AMQP_URL || "amqp://54.147.21.63",
      options
    );
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

          console.log(" [x] Recibido 1'%s'", data);
          const body = JSON.stringify({
            email: data,
          });
          await fetch("http://54.164.233.42/notification/putPassword", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          })
            .then((res) => res.json())
            .then((data) => console.log(data))
            .catch((error) => console.log(error));

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
const consumer2 = async () => {
  const queue = process.env.AMQP_QUEUE_USERNAME;
  const routingKey = process.env.AMQP_ROUTINGKEY2;
  try {
    const conn = await amqp.connect(process.env.AMQP_URL, options);
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
            email: data,
          });
          await fetch("http://54.164.233.42/notification/putUsername", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          })
            .then((res) => res.json())
            .then((data) => console.log(data))
            .catch((error) => console.log(error));
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
consumer2();
