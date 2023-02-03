# StudentShare - Frontend Webseite
## Vue 3 Typescript Projekt
Hochschule RheinMain - Informatik (Master of Science) - CloudComputing - Wintersemester 2022/2023 <br>
Gruppenmitglieder: **Jörn Bachmeier, Sebastian Braun, Sandra Kiefer**

## Startanweisungen / Depoly

Zum Hochladen und Herunterfahren der statischen Webseite gibt es jeweils ein Skript. Es muss lediglich die Goolge Cloud Projekt ID mitgegben werden, danach werden die weiteren Schritte automatisch ausgeführt.
```sh
sh createWebsite.sh [PROJECT_ID]
sh deleteWebsite.sh [PROJECT_ID]
```
Das lokale Testen des Vue Projektes kann ebenfalls per Befehl ausgeführt werden.
```sh
npm run serve
```

## Beschreibung

Das Frontend der Webanwendung ist als Single-Page-Application mit dem Framework Vue.js realisiert. Der statische Export der Webseite wird über ein Content Delivery Network (CDN) oder eine Google App Engine (GAE) den verschiedenen Clients zur Verfügung gestellt. Da für das Hosten der Webseite über das CDN eine Top-Level-Domain benötigt wird und diese nicht in der kostenlosen Testphase inbegriffen ist, nutzen wir die in der kostenlosen Testversion enthaltene GAE. Je nach Aufrufzahlen kann das Hosten der statischen Webseite in der GAE weniger kosten, da eine kostenlose Stufe der GAE bereitgestellt wird und dies bei herkömmlichen Hosting-Anbieter nicht der Fall ist.

![3rd-Party-Authenfication](/documentation/pics/website1.png)

Die Webseite ist in zwei Pfade mit unterschiedlichen Ansichten unterteilt. Ruft der Nutzer die Webseite erstmals auf, gelangt er auf den Login-Screen mit einem Button für die Third-Party Authentifizierung und Autorisierung mit einem beliebigen Google Account des Nutzers. Nach erfolgreicher Authentifizierung und Autorisierung des Google-Accounts öffnet sich ein weiterer Dialog mit der Aufforderung, die angehörigen Fachbereiche (fundieren als Rollen des Nutzers) zu selektieren. Dies ist nur beim erstmaligen Anmelden auf der Webseite nötig, da diese zusätzlichen Informationen des Fachbereichs in späteren Schritte benötigt werden. Das vom Backend übergebene JSON Web Token (JWT) wird in den Cookies des Browsers gespeichert und bei jeder nachfolgenden Anfrage zur Autorisierung mitgeschickt. 

![Registrierung](/documentation/pics/website2.png)

Anschließend wird der Nutzer auf den File-Screen weitergeleitet. Dort werden alle Dateien angezeigt, auf die der Nutzer Zugriff hat. Mithilfe des Dropdown kann der Nutzer sich nur die Dateien des jeweiligen Fachbereichs anzeigen lassen. Sind sehr viele Dateien hochgeladen, können über eine Suchleiste die Dateien gefiltert werden oder nach verschiedenen Kriterien die Dateien in der Liste sortiert werden. Zusätzlich ist das Hoch- und Herunterladen von Dateien möglich. Jedoch kann ein Nutzer nur die Dateien löschen, welche ihm gehören und selbst hochgeladen worden sind. Zusätzlich kann auf der Webseite ein Chat aufgeklappt werden, über den die Nutzer sich austauschen und nach Hilfestellungen oder Dateien fragen können. Des Weiteren kann der Nutzer sich ausloggen, wird wieder zum Login-Screen zurückgeleitet und das JWT wird aus den Cookies im Browser gelöscht.

![Screenshot der Webanwendung](/documentation/pics/files.png)

![Chat](/documentation/pics/website3.png)
