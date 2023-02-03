# StudentShare - API Gateway
Hochschule RheinMain - Informatik (Master of Science) - CloudComputing - Wintersemester 2022/2023 <br>
Gruppenmitglieder: **Jörn Bachmeier, Sebastian Braun, Sandra Kiefer**

## Startanweisungen / Depoly

Zum Hochladen und Herunterfahren des API Gateways gibt es jeweils ein Skript. Es muss lediglich die Goolge Cloud Projekt ID mitgegben werden, danach werden die weiteren Schritte automatisch ausgeführt.
```sh
sh createApiGateway.sh [PROJECT_ID]
sh deleteApiGateway.sh [PROJECT_ID]
```

## Beschreibung

Das API Gateway sitzt zwischen dem Client und den verschiedenen Microservices im Backend (Benutzerverwaltung, Dateiverwaltung, Chatverwaltung).  Das Gateway nimmt alle API-Aufrufe des Clients entgegen und gibt diese an die entsprechenden Services weiter. 

Bei dem Erstellen des Gateways in der Google Cloud wird ein Service-Account hinterlegt, welcher zur Autorisierung der Anfrage an das Backend genutzt wird. Die entsprechenden Microservice sind nicht öffentlich verfügbar, erlauben jedoch nach entsprechender Autorisierung den Zugriff auf den Microservice mithilfe des Service-Accounts des Gateways. Dem Service-Account müssen dazu die benötigten Rollen und Zugriffsrechte erteilt werden. Somit sind die Microservice nur über das Gateway öffentlich im Internet zu erreichen. 

![Dokumentation REST API Schnittstellen](documentation/pics/apigateway.png)

Zusätzlich sind einige Pfade mit JWT gesichert, auf welche nur registrierte und angemeldete Nutzer zugreifen sollen (Datei- und Chatverwaltung). Das JWT wird vom Client an die Anfrage ans Gateway angehängt. Das Gateway validiert die Signatur des Tokens mit dem öffentlichen Schlüssel. Dieser Schlüssel wird zuvor von der Benutzerverwaltung beim Anmelden des Nutzers festgelegt und das Token mithilfe des privaten Schlüssels erstellt. Nur wenn ein gültiges JWT mitgeschickt wird, leitet das Gateway die Anfrage an den entsprechenden Microservice weiter. 
