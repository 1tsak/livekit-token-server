const express = require('express');
const bodyParser = require('body-parser');
const { AccessToken } = require('livekit-server-sdk');
require("dotenv").config()
const cors = require('cors');


const app = express();
const port =  8000; // Change the port as needed

app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;


console.log(apiKey,apiSecret);

const createToken = (userInfo, grant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = '5m';
  at.addGrant(grant);
  return at.toJwt();
};

const roomPattern = /\w{4}\-\w{4}/;

app.get('/createToken', (req, res) => {
  try {
    const { roomName, identity, name, metadata } = req.query;

    if (typeof identity !== 'string' || typeof roomName !== 'string') {
      res.status(403).end();
      return;
    }

    if (Array.isArray(name)) {
      throw Error('provide max one name');
    }
    if (Array.isArray(metadata)) {
      throw Error('provide max one metadata string');
    }

    if (!roomName.match(roomPattern)) {
      res.status(400).end();
      return;
    }

    const grant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    const token = createToken({ identity, name, metadata }, grant);

    res.status(200).json({
      identity,
      accessToken: token,
    });
  } catch (e) {
    res.statusMessage = e.message;
    res.status(500).end();
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
