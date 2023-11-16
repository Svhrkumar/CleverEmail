const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// RabbitMQ connection (replace with your CloudAMQP details)
const rabbitMQUrl =
	'amqps://ychmqsmg:vQSLIeVE_vx2qElbeoehxuBY6-_25Wy8@goose.rmq2.cloudamqp.com/ychmqsmg';

// Nodemailer setup
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'clevercoder99@gmail.com',
		pass: 'zxta euta vxbb kqar',
	},
	debug: true,
});
// Example HTML content with images
const htmlContent = `
  <html>
    <body>
      <h1>Hello,</h1>
      <p>This is a well-formatted email with images:</p><br/>
      <p>Thanks</p>
    </body>
  </html>
`;

// Example usage

// Express route to send a message
app.post('/send', async (req, res) => {
	const message = req.body.message;

	// Send message to RabbitMQ
	const connection = await amqp.connect(rabbitMQUrl);
	const channel = await connection.createChannel();
	const queueName = 'messages';
	await channel.assertQueue(queueName, { durable: false });
	channel.sendToQueue(queueName, Buffer.from(message));

	console.log(`Message sent to RabbitMQ: ${message}`);

	// Send email using Nodemailer
	sendEmailWithImages(
		'svhrkumar944@gmail.com',
		'Well-formatted Email',
		htmlContent
	);
	sendEmail('svhrkumar944@gmail.com', 'New Message', message);

	res.status(200).json({ status: 'Message sent successfully' });
});

// Express route to receive messages
app.get('/receive', (req, res) => {
	const queueName = 'messages';

	// Consume messages from RabbitMQ
	amqp
		.connect(rabbitMQUrl)
		.then((connection) => connection.createChannel())
		.then((channel) => {
			channel.assertQueue(queueName, { durable: false });
			channel.consume(
				queueName,
				(message) => {
					const content = message.content.toString();
					console.log(`Received message from RabbitMQ: ${content}`);

					// Send email using Nodemailer
					sendEmailWithImages(
						'svhrkumar944@gmail.com',
						'Well-formatted Email',
						htmlContent
					);
					sendEmail('svhrkumar944@gmail.com', 'New Message', content);

					channel.ack(message);
				},
				{ noAck: false }
			);

			res.status(200).json({ status: 'Receiving messages...' });
		})
		.catch((error) => {
			console.error('Error setting up RabbitMQ connection:', error);
			res.status(500).json({ status: 'Error receiving messages' });
		});
});

// // Function to send emails
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

// Function to send emails with HTML content and images
function sendEmailWithImages(to, subject, htmlContent) {
	const mailOptions = {
		from: 'clevercoder99@gmail.com',
		to,
		subject,
		html: htmlContent,
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
