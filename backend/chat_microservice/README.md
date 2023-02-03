# StudentShare - Chatverwaltung
## Google App Engine & Firestore Datenbank
Hochschule RheinMain - Informatik (Master of Science) - CloudComputing - Wintersemester 2022/2023 <br>
Gruppenmitglieder: **Jörn Bachmeier, Sebastian Braun, Sandra Kiefer**

## Startanweisungen / Depoly

Zum Hochladen und Herunterfahren des Microservices gibt es jeweils ein Skript. Es muss lediglich die Goolge Cloud Projekt ID mitgegben werden, danach werden die weiteren Schritte automatisch ausgeführt.
```sh
sh createChatMicroservice.sh [PROJECT_ID]
sh deleteChatMicroservice.sh [PROJECT_ID]
```
Das lokale Testen des Websockets kann ebenfalls per Befehl ausgeführt werden.
```sh
node server.js
```

## Beschreibung

Für den Chat Microservice wird die Google App Engine verwendet, da für den Chat der Anwendung eine dauerhafte Websocketverbindung zu einem Server benötigt wird. In der App Engine läuft ein Express.js Server, der als Websocket-Server die Kommunikation zu den Clients übernimmt. Die Verbindung per Websocket ermöglicht es, neue Chatnachrichten ohne Verzögerung zu senden und zu empfangen. Für die Websockets wird die Libary Socket.io verwendet. 

Der Chat Microservice ist mit der NoSQL-Datenbank Firestore verbunden, in der die Chatnachrichten mit Informationen über den User (Name + E-Mail) sowie die Uhrzeit der Chatnachricht gespeichert werden. Dies ermöglicht es, alle alten Nachrichten nach erfolgreicher Anmeldung im Frontend aus der Datenbank zu laden und diese im Chatverlauf anzeigen zu lassen. Eine NoSQL-Datenbank eignet sich für diesen Anwendungsfall sehr gut, da die Informationen jeweils als Key-Value-Paare gespeichert werden. Die Key-Attribute “Name”, “E-Mail”, “Date” und “Message” werden dann mit Informationen eines übermittelten Chatobjekts gefüllt und gespeichert. Mit Firestore lassen sich mehrere Tausend Chatobjekte pro Sekunde verarbeiten und speichern, sodass der Microservice fehlerfrei laufen kann. 

![Swimlanediagramm Chatverwaltung](documentation/pics/chat_swimlane.png)

Normalerweise müssen die Microservices nicht eigenständig die JWT-Token der User verifizieren. Der Chat Microservice ist jedoch ein Sonderfall. Im Regelfall übernimmt das API-Gateway die Authentifizierung und Autorisierung. Aufgrund der Inkompatibilität von Googles API-Gateway mit der Websocketverbindung muss der Chat Microservice dies eigenständig durchführen. 

Zum Verbindungsaufbau wird vom Client das JWT-Token als Authentisierung im Header mitgeschickt. Im Backend wird dieses Token verifiziert. Sollte es ungültig sein, wird die Socketverbindung zum Client getrennt. Mit einem gültigen Token werden nun die Nachrichten im Backend aus der NoSQL-Datenbank geladen und an den Client zum Frontend gesendet. Die Nachrichten werden dann nach Datum sortiert und im Pop-up-Chat dargestellt. 
Sobald ein Client eine neue Nachricht sendet, wird ein Chatobjekt mit den Werten “Name”, “E-Mail”, “Date” und “Message” an den Server gesendet. Die Werte “Name” und “E-Mail” werden aus dem JWT-Token der aktuellen Session im Frontend an das Chatobjekt übergeben. Im Backend werden die Werte des Objektes dann gegen die Werte des beim Verbindungsaufbau mitgeschickten JWT-Tokens geprüft. Sollten diese Werte nicht identisch sein, wird die Socketverbindung zum Client getrennt. Bei identischen Werten wird das neue Chatobjekt in der NoSQL-Datenbank gespeichert und anschließend an alle anderen verbundenen Clients gesendet. Diese stellen die neue Chatnachricht dann in Echtzeit im Frontend dar.

Sollte ein Client die Verbindung zum Server verlieren oder die Webseite schließen, wird die Socketverbindung zum Server automatisch getrennt. 
