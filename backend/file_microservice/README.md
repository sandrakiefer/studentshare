# StudentShare - Dateiverwaltung
## Google Cloud Run & Firestore Datenbank & Cloud Storage
Hochschule RheinMain - Informatik (Master of Science) - CloudComputing - Wintersemester 2022/2023 <br>
Gruppenmitglieder: **Jörn Bachmeier, Sebastian Braun, Sandra Kiefer**

## Startanweisungen / Depoly

Zum Hochladen und Herunterfahren des Microservices gibt es jeweils ein Skript. Es muss lediglich die Goolge Cloud Projekt ID mitgegben werden, danach werden die weiteren Schritte automatisch ausgeführt.
```sh
sh createFileMicroservice.sh [PROJECT_ID]
sh deleteFileMicroservice.sh [PROJECT_ID]
```
Das lokale Testen des NodeJS Express Server kann ebenfalls per Befehl ausgeführt werden.
```sh
node server.js
```

## Beschreibung

Der File Microservice kümmert sich um alle Files, der angemeldeten User und läuft über Cloud Run in einem Node JS Container in der Cloud. In diesem Container läuft ein Express.js Server, der über eine Rest Schnittstelle von dem API Gateway angesteuert wird und alle Aufgaben der File Verwaltung übernimmt.

Die Files werden mit allen nötigen Informationen in zwei unterschiedlichen Datenbanken gespeichert: 

![File Microservice Communication](/documentation/pics/file_microservice_communication.png)

Das File Objekt an sich wird in einem Google Cloud Storage Bucket gespeichert. Im Cloud Storage Umfeld sind Buckets eine Art Container, in denen Daten in Form von Objekten abgespeichert werden. Im Gegensatz zu üblichem Storage erfolgt die Ablage nicht in Ordnerstrukturen und Dateien. Das Verschachteln ist nicht erlaubt. Der Bucket hat einen global eindeutigen Namen und ist über eine URL erreichbar. Die abgespeicherten Objekte haben eindeutige Ids oder auch Dateinamen in dem Bucket. Um eine Datei herunterzuladen benötigt es nur den Namen des Buckets und des Objektes. Deshalb muss dem Anwender nicht bekannt sein, wo der Standort des physischen Speichers ist. Außerdem ist die Anzahl an Objekten, die in einem Google-Bucket gespeichert werden können, unbegrenzt und damit ideal geeignet für seine Aufgabe in diesem Projekt.

Damit der User Informationen über die Dateien angezeigt bekommt und die Applikation weiß, welchem User es welche Daten anzeigen darf, braucht es weitere Informationen über die Datei und den Ersteller. Diese stehen in einer Google Cloud NoSQL Firestore Datenbank, die pro hochgeladenes File ein Dokument abspeichert, das alle nötigen Informationen inne hat. Ein Dokument besteht aus mehreren Feldern, denen Werte zugeordnet sind. Die Dokumente werden in Sammlungen gespeichert und dienen in diesem Projekt als Akte für das zugeordnete File im Bucket. Das hat den Vorteil, dass alle Informationen, die in der Applikation immer wieder Verwendung finden, dank der Echtzeit-Listeners schnell zu erreichen sind. Außerdem können den Abfragen mehrere verkettete Filter enthalten sein, um File-Listen schnell zu erzeugen oder zu sortieren. Dadurch müssen teure Anfragen auf die Daten im Bucket nur getätigt werden, wenn ein User das File herunterladen oder löschen möchte.

In der Applikation werden viele Informationen angezeigt, die der User über die Daten wissen muss, wie zum Beispiel die Größe des Files, welchen Namen die Datei trägt und von wem und wann es hochgeladen wurde. Außerdem braucht die Applikationen Informationen über den Ersteller des Files, über die Sichtbarkeit und Rechte und die Verbindung zum eigentlichen File im Bucket. Das Dokument und das abgelegte File im Bucket tragen dabei den gleichen eindeutigen Namen als Id, damit es zu keinen Verwechslungen kommt.

Um die Eindeutigkeit des Users zu garantieren wird nach dem einloggen seine E-Mail Adresse im JWT Token gespeichert. Auch seine Rechte bzw. eingetragenen Kurse stehen in dem Token. Dieses Token wird über das API Gateway an das Backend geschickt und ausgelesen, um den angemeldeten User von den anderen zu unterscheiden und ihm ausschließlich die Files anzuzeigen für die er registriert ist. Es wird darauf geachtet, dass Files nur in den Fachbereich hochgeladen und angezeigt werden für die sie gedacht sind. Auch darf ein User nur die Files, die er selbst hochgeladen hat wieder löschen, aber jede Datei, die ihm angezeigt wird herunterladen. Dafür wird zu jeder Zeit die Rechte bzw. eingetragenen Kurse des Users benötigt.

Der File Microservice besitzt verschiedene Endpunkte, um alle diese Funktionen und Abhängigkeiten umzusetzen:

Nachdem sich der User über Google angemeldet und seine Kurse ausgewählt hat gelangt er auf die Startseite der App und bekommt alle verfügbaren Files seiner ausgewählten Kurse angezeigt. Dafür werden seine User Informationen über das JWT Token an den Microservice geschickt. Das Backend ließt das Token aus und erzeugt anhand der Kursinformationen eine Liste an verfügbaren Files im Bucket über die Dokumente im Firestore. Diese Liste wird an das Frontend geschickt und nach Upload-Datum sortiert.

Da ein User für mehrere Kurse registriert sein wird, kann er mit dem Dropdown Menü nach ihnen filtern. Über diesen Endpunkt enthält das Frontend eine Liste an verfügbaren Files für nur einen ausgewählten Kurs. Falls der User die hochgeladenen Files einer Person ansehen möchte kann er auf den Namen dieser Person klicken. Das Frontend bekommt über diesen Endpunkt alle Files einer bestimmten Person, aber nur für die Kurse, in denen beide registriert sind. Sollte die ausgewählte Person auch Files für andere Kurse hochgeladen haben bekommt der User nur die Dateien angezeigt, die zu seinen Kursen passen. Dafür ist es wichtig, dass sowohl die E-Mail Adresse als auch die Liste der Kurse im JWT Token stehen, damit die ausgewählte Person auch eindeutig von den anderen Usern unterschieden werden kann.

Wenn der User eine Datei gefunden hat, die er herunterladen möchte, dann kann er dies mit jedem für ihn angezeigten File machen. Der Endpunkt zum herunterladen der Files benötigt nur die Id der Datei, der Rest kommt über das JWT Token. Im Backend wird noch einmal geprüft, ob der User die richtigen Rechte für die Aktion hat und ob die zu herunterladene Datei existiert. Ist das der Fall, wird das File über die Id im Dokument ausgewählt und für den User heruntergeladen. Sollte es nicht funktionieren bekommt der User eine entsprechende Nachricht.

Hat der User selbst Dateien, die er für andere Studenten in seinem Kurs zur Verfügung stellen möchte, dann kann er das jederzeit tun. Über diesen Endpunkt werden alle Informationen geschickt, die für die Erstellung eines Bucket-Dokument Paars benötigt werden. Aus dem Frontend wird das zu hochladene File als “FormData” mit “Axios” an das Backend geschickt. Dieses macht mit “Multer” daraus ein Objekt des Types “File”.

Als erstes wird das Filename gesichert, um es im Frontend anzuzeigen. Mit dem Filename wird danach eine eindeutige Id erzeugt, damit sowohl das Dokument als auch das Objekt im Bucket leicht und eindeutig zu erreichen sind. Hat der Bucket noch kein File mit diesem Namen wird sich der Name gesichert und ein “WriteStream” geöffnet, um das File in den Bucket zu laden. Ist dies erfolgreich gewesen, wird das Dokument mit allen wichtigen Informationen erzeugt.

![File Object](/documentation/pics/file_interface.png)

Aus den Metadaten des Files erhält das Dokument “date, filesize, filename, file_id”, aus dem JWT Token “owner, email, rights” und in späteren Versionen könnte es über das Frontend noch “password und visibility” bekommen. Alle diese Informationen werden zusätzlich zu dem hochgeladenen File getrennt gespeichert, um jederzeit einen schnelle Zugriff auf sie zu haben.

Möchte der User ein File wieder löschen geht das nur wenn die E-Mail Adresse des File Eigentümers und des Users übereinstimmen. Ist das der Fall löscht das Backend das ausgewählt File über den Endpunkt mit der mitgegebene Id aus dem Bucket und der Sammlung heraus und gibt dem Frontend einen Boolean über die Lage zurück.

In diesem Kapitel wurde erläutert, warum zwei unterschiedliche Datenbänke für idesen Microservice genutzt werden und welche Aufgabenbereiche abgedeckt werden. Im späteren Fazit wird besprochen, welchen Vorteil dabei das Aufteilen der Aufgaben in verschiedene Microservices hat.
