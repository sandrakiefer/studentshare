# StudentShare - Benutzerverwaltung
## Google Cloud Functions & MySQL Datenbank
Hochschule RheinMain - Informatik (Master of Science) - CloudComputing - Wintersemester 2022/2023 <br>
Gruppenmitglieder: **Jörn Bachmeier, Sebastian Braun, Sandra Kiefer**

## Startanweisungen / Depoly

Zum Hochladen und Herunterfahren des Microservices gibt es jeweils ein Skript. Es muss lediglich die Goolge Cloud Projekt ID mitgegben werden, danach werden die weiteren Schritte automatisch ausgeführt.
```sh
sh createUserMicroservice.sh [PROJECT_ID]
sh deleteUserMicroservice.sh [PROJECT_ID]
```
Das lokale Testen des NodeJS Express Server kann ebenfalls per Befehl ausgeführt werden.
```sh
node index.js
```

## Beschreibung

Bei der Realisierung des Microservices Benutzerverwaltung haben wir uns für Google Cloud Functions entschieden. Dabei handelt es sich um ein Functions as a Service (FaaS) Produkt, welches ohne Server oder Container ausführbar ist und automatisch nach der jeweiligen Arbeitslast skaliert. Grundsätzlich zahlt man je Aufruf der Funktion und nur solange, wie die Funktion ausgeführt wird. Zusätzlich sind die ersten zwei Millionen Aufrufe pro Monat dabei kostenlos. Google Cloud Run besitzt ebenfalls diese kostenlose Stufe, jedoch handelt es sich dabei um eine Container verwaltete Plattform. Aufgrund der technischen Anforderungen des Projekts und dem Benutzen möglichst vieler Technologien der Google Cloud haben wir uns bei der Dateiverwaltung für Cloud Run und bei der Benutzerverwaltung für Cloud Functions entschieden.

Die Benutzerverwaltung ist hauptsächlich für das Speichern und Verwalten der Nutzer in der Datenbank und das Erzeugen von JSON Web Token (JWT) verantwortlich. MySQL wird dabei als relationales Datenbank genutzt, da es sich bei den zu speichernden Nutzerinformationen um strukturierte und konsistente Daten handelt. Zudem kommt hinzu, dass nur beim Anmelden des Nutzers einmalig auf die Datenbank zugegriffen werden muss und danach die benötigten Informationen im JWT mitgespeichert und mitgeschickt werden. Würde es sich um größere Datensätze mit deutlich mehr Leseabfragen handeln, wäre es sinnvoll eine nicht-relationale Datenbank zu verwenden. Die Tabelle der Nutzer in der Datenbank besitzt die Felder E-Mail (Primärschlüssel), Name und Fachbereiche (eine Liste in Form eines mit Komma getrennten Strings).

Um die Funktionsweise der Benutzerverwaltung besser erklären zu können, gehe ich im Folgenden die einzelnen Schritte durch, wenn sich ein Nutzer das erste Mal bei der Webanwendung anmeldet (Visualisierung der einzelnen Funktionsaufrufe im untenstehenden Sequenzdiagramm). Zu Beginn ruft der Nutzer die Webanwendung auf. Dort befindet sich ein Button für die Weiterleitung zur Anmeldung mit einem Google Account. Dazu wird der Nutzer auf einen Google OAuth 2.0 Endpunkt weitergeleitet und erteilt der Webanwendung die benötigten Berechtigungen. Ist die Autorisierungssequenz abgeschlossen, erhält der Client ein JWT von Googeln, welches die Accountinformationen des Nutzers beinhaltet. Der Client schickt nun über das API Gateway eine Anfrage an den Microservice Benutzerverwaltung, ob der Nutzer sich zum ersten Mal auf der Webanwendung anmeldet, das heißt noch nicht seine Informationen in der Datenbank gespeichert sind. Ist dies nicht der Fall, wird der Nutzer auf der Webseite aufgefordert, seine Fachbereiche anzugeben. Jetzt wird erneut über das API Gateway eine Anmeldeaufforderung an das Backend geschickt, diese beinhaltet das von Google erzeugte JWT und die zuvor angegebenen Rollen (beziehungsweise Fachbereiche). In der Benutzerverwaltung wird zunächst die Signatur des JWT von Google auf ihre Gültigkeit überprüft und die Informationen des Nutzers herausgelesen. Anschließend wird der Nutzer mit seiner E-Mail, dem Namen und den Fachbereichen in der Datenbank gespeichert. 

![Sequenzdiagramm Benutzerverwaltung](/documentation/pics/user_ms1.png)

Zuletzt wird ein neues JWT mit einem privaten Schlüssel mit dem RS256-Algorithmus asymmetrisch verschlüsselt. Dieses Token beinhaltet alle Informationen des Nutzers (siehe Beispiel eines decodierten JWT). Der Client speichert anschließend das Token mit den Informationen in den Cookies des Webbrowsers. Bei allen folgenden Anfragen wird im Header das Token mitgeschickt. Das JWT wird anschließend vom API Gateway auf seine Gültigkeit überprüft und nur nach erfolgreicher Überprüfung an den entsprechenden Microservice im Backend weitergegeben. 

![Dekodiertes JWT](/documentation/pics/user_ms2.png)
