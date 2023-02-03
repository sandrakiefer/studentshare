var express = require('express');
var app = express();
var server = require('http').createServer(app);
const fs = require("fs");
var cors = require('cors');
const jwt = require("jsonwebtoken");
const clientURL = "https://website-dot-studentshare.ey.r.appspot.com";

// Mit dieser zusätzlichen Zeile bringen wir Socket.io in unseren Server
// und legen die CORS Regeln für die Socketverbindung fest.
var io = require('socket.io')(server, {
    cors: {
        origin: clientURL,
        methods: ["GET", "POST"]
    }
});

// Google CLoud Libary für Firestore und Collectionname
const { Firestore } = require('@google-cloud/firestore');
const fireStoreName = "fileshare_chat";

// Client erstellen
const firestore = new Firestore();

// CORS Regeln für den Aufruf der App Engine
app.use(cors({
    origin: clientURL,
}));

// Mit diesem Kommando starten wir den Webserver.
var port = process.env.PORT || 3000;
server.listen(port, function() {
    // Wir geben einen Hinweis aus, dass der Webserer läuft.
    console.log('Webserver läuft und hört auf Port %d', port);
});


// === Ab hier folgt der Code für den Chat-Server

// Hier werden die Informationen aus dem Token decoded
function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// Hier werden alle Nachrichten aus der Datenbank geladen.
async function getAllMessages() {
    const query = firestore.collection(fireStoreName);
    let chats = [];

    querySnapshot = await query.get();
    querySnapshot.forEach((doc) => {
        chats.push(doc.data());
    })
    return chats;
}

// Hier sagen wir Socket.io, dass wir informiert werden wollen,
// wenn sich etwas bei den Verbindungen ("connections") zu 
// den Browsern tut. 
io.on('connection', async function(socket) {
    // Die variable "socket" repräsentiert die aktuelle Web Sockets
    // Verbindung zu jeweiligen Browser client.

    // Für erfolgreichen Zugriff muss das mitgesendete 
    // Token erfolgreich verifiziert werden.
    let token = socket.handshake.auth.token;
    const key = fs.readFileSync("./key.pem");

    try {
        jwt.verify(token, key, {
            algorithms: ["RS256"]
        });
    } catch (error) {
        console.log(error);
        // Ansonsten wird die Clientverbindung geschlossen. 
        socket.disconnect();
    }

    // Informationen aus dem Token in Variablen speichern, um diese 
    // anschließend mit den Informationen aus den Nachrichten abzugleichen.
    decodedToken = parseJwt(token);
    var email = decodedToken.email;
    var name = decodedToken.name;
    console.log(`User joined chat: ${name}, ${email}`);

    // Alte Nachrichten aus der Datenbak abrufen. 
    let dbData = await getAllMessages();

    // Dem Client werden die letzten Chatnachrichten geschickt.
    socket.emit('login', dbData);

    // Funktion, die darauf reagiert, wenn ein Benutzer eine Nachricht schickt
    socket.on('new message', async function(data) {

        // Überprüfen, ob Informationen aus der Nachricht (Token von Frontend) mit den
        // Informationen aus dem anfänglich gesendeten Token übereinstimmen.
        if (data.email === email && data.name === name) {

            // Firestore Verbindung vorbereiten.
            const docRef = firestore.collection(fireStoreName).doc(Date.now().toString())

            // Chatobjekt erstellen
            const chat = {
                name: data.name,
                message: data.message,
                date: data.date,
                email: data.email,
            };

            // Neues Chatobjekt in der Datenbank speichern. 
            await docRef.set(chat);

            // Sende die Nachricht an alle Clients um den Chat upzudaten. 
            io.emit('new message', {
                date: chat.date,
                name: chat.name,
                message: chat.message,
                email: chat.email,
            });

        } else {
            // Verbindung trennen, falls Informationen nicht übereinstimmen. 
            socket.disconnect();
        }
    });

    // Funktion, die darauf reagiert, wenn sich ein Benutzer abmeldet.
    // Benutzer müssen sich nicht explizit abmelden. "disconnect"
    // tritt auch auf wenn der Benutzer den Client einfach schließt.
    socket.on('disconnect', function() {

        // Alle über den Abgang des Benutzers informieren
        socket.broadcast.emit('user left', name);

    });
});