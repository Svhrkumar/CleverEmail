const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// RabbitMQ connection
const rabbitMQUrl =
	'amqps://ychmqsmg:vQSLIeVE_vx2qElbeoehxuBY6-_25Wy8@goose.rmq2.cloudamqp.com/ychmqsmg';
let channel;

async function setupRabbitMQ() {
	const connection = await amqp.connect(rabbitMQUrl);
	channel = await connection.createChannel();
	const queueName = 'messages';

	await channel.assertQueue(queueName, { durable: false });
	console.log(`Connected to RabbitMQ. Queue: ${queueName}`);
}

setupRabbitMQ();

// Nodemailer setup
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'clevercoder99@gmail.com',
		pass: 'zxta euta vxbb kqar',
	},
	debug: true,
});

// Express route to send a message
app.post('/send', async (req, res) => {
	const message = req.body.message;

	// Send message to RabbitMQ
	channel.sendToQueue('messages', Buffer.from(message));

	console.log(`Message sent to RabbitMQ: ${message}`);

	// Send email using Nodemailer
	sendEmail('svhrkumar944@gmail.com', 'New Message', message);

	res.status(200).json({ status: 'Message sent successfully' });
});

// Express route to receive messages
app.get('/receive', (req, res) => {
	const queueName = 'messages';

	// Consume messages from RabbitMQ
	channel.consume(
		queueName,
		(message) => {
			const content = message.content.toString();
			console.log(`Received message from RabbitMQ: ${content}`);

			// Send email using Nodemailer
			sendEmail('svhrkumar944@gmail.com', 'New Message', content);

			channel.ack(message);
		},
		{ noAck: false }
	);

	res.status(200).json({ status: 'Receiving messages...' });
});

// Function to send emails
function sendEmail(to, subject, text) {
	const mailOptions = {
		from: 'clevercoder99@gmail.com',
		to,
		subject,
		text,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error sending email:', error);
		} else {
			console.log('Email sent:', info.response);
		}
	});
}

// Start the Express server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
