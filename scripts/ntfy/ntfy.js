const axios = require('axios');
const fs = require('fs');
const base64 = require('base-64');

const API_URL = 'https://ntfy.sh';

async function publish(topic, messageJsonFile) {
  const message = JSON.parse(fs.readFileSync(messageJsonFile, 'utf8'));
  const base64Message = base64.encode(JSON.stringify(message));

  try {
    const response = await axios.post(API_URL, {
      topic: topic,
      message: base64Message,
      title: 'Event published',
      tags: message.tags || [],
      attach: message.attach || '',
    });
    console.log(`Status: ${response.status}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}


async function subscribe(topic) {
  try {
    const response = await axios.get(`https://ntfy.sh/${topic}/json?poll=1`);
    const base64Message = response.data.message;

    const messageJson = JSON.parse(Buffer.from(base64Message, 'base64').toString('utf-8'));

    console.log("Decoded Message:", messageJson);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function subscribeWithInterval(topic, interval = 5000) {
  subscribe(topic);
  setInterval(() => subscribe(topic), interval);
}

function printHelp() {
  console.log(`
Usage:
  node ntfy.js --publish <topic> <message.json>       Publish a message to a topic
  node ntfy.js --subscribe <topic>                    Receive messages from a topic (one-time)
  node ntfy.js --subscribe-live <topic>               Receive live updates of messages from a topic

Options:
  node ntfy.js --help                                 Show this help message

Examples:
  node ntfy.js --publish meinThema message.json       Publish a message to 'meinThema' topic
  node ntfy.js --subscribe meinThema                  Receive messages from 'meinThema' topic
  node ntfy.js --subscribe-live meinThema             Receive live updates of messages from 'meinThema' topic

Note:
A sample message.json file is available in the scripts/ntfy folder. You can use it as a reference or modify it according to your needs.
  `);
}

const command = process.argv[2];
const topic = process.argv[3];

if (command === '--publish') {
  const messageJsonFile = process.argv[4];
  publish(topic, messageJsonFile);
} else if (command === '--subscribe--live') {
  subscribeWithInterval(topic);
} else if (command === '--subscribe') {
    subscribe(topic);
} else if (command === '--help') {
  printHelp();
} else {
  console.error('Ungültige Eingabe. Verwenden Sie "--help", um Anweisungen zur Verwendung des Skripts anzuzeigen.');
}
