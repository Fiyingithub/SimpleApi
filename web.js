import express from 'express';
import { WebSocketApp } from 'express-ws-easy';  


const app = express();
const port = 3000;

// Middleware to parse JSONf
app.use(express.json()); 
 
const server = new WebSocketApp(app, port, 1234);
const corsOptions={
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}

app.get('/', (req, res) => {
    res.send('WebSocket Server is running');
});

app.post('/send', (req, res) => {
    const data = req.body; 
    server.getController().notifyDataToBothClients(data.receiver,data.sender, data); 
    res.send('Message sent to the specified client');
});

server.listen(() => {
    console.log(`Server running on port ${port}`);
});