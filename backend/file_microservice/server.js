const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require("fs");

const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const { memoryStorage } = require("multer");

const encryptionKey = crypto.randomBytes(32);
const upload = multer({
    storage: memoryStorage(),
    encryptionKey: encryptionKey,
    limits: {
        fileSize: 10 * 1024 * 1024 // no files larger then 10mb
    },
});

const VISIBILITY = true;
const FIRESTORENAME = "fileshare-firestore";
const BUCKETNAME = "studentshare-fileshare-bucket";
const PORT = process.env.PORT || 8080;

const db = new Firestore();
const storage = new Storage();
const app = new express();

// Application SETTINGS //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://website-dot-studentshare.ey.r.appspot.com",
    // origin: "*",
}));
app.listen(PORT, () => {
    console.log(`Student-Fileshare Rest API listening on port ${PORT}`);
});

// Application //

app.get('/files', async (req, res) => {
    // const googleToken = req.headers.authorization.split(' ')[1];
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);
    const query = db.collection(FIRESTORENAME);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
        res.send([]);
    } else {
        const file_information = get_right_docs(querySnapshot, userInformation.courses);
        res.send(file_information);
    }
})

app.get("/owner", async (req, res) => {
    // const googleToken = req.headers.authorization;
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);
    const email = req.query.email;
    var query = db.collection(FIRESTORENAME);

    if (email == userInformation.email) {
        const querySnapshot = await query.where("email", "==", email).get();
        if (!querySnapshot.empty) { res.json(get_right_docs(querySnapshot, userInformation.courses)); }
        else { res.json({ status: "You didn't upload any files!" }); }
    } else {
        const querySnapshot = await query.where("email", "==", email).where("public", "==", true).get();
        if (get_right_docs(querySnapshot, userInformation.courses).length > 0) { res.json(get_right_docs(querySnapshot, userInformation.courses)); }
        else { res.json({ status: "You don't have the rights!" }); }
    }
});

app.post("/delete", async (req, res) => {
    // const googleToken = req.headers.authorization;
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);

    const filename = req.query.docname;
    const docname = filename.replace(/\s/g, "%20");
    const doc = await db.collection(FIRESTORENAME).doc(docname).get();

    if (doc.data() != undefined && doc.data().email == userInformation.email) {
        await storage.bucket(BUCKETNAME).file(filename).delete()
            .then(response => {
                console.log("Successful deleted File from bucket!");
            }).catch(error => {
                console.log("Couldn't delete this File from the bucket!");
                res.status(500).send();
                return;
            });

        await db.collection(FIRESTORENAME).doc(docname).delete()
            .then(response => {
                console.log("Successful deleted File from Collection!");
            }).catch(error => {
                console.log("Couldn't delete this File from the Collection!");
                res.status(500).send();
                return;
            });

            res.status(200).send();
    } else { res.status(500).send(); }
})

app.post("/upload", upload.single("file"), async (req, res) => {
    // const googleToken = req.headers.authorization;
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);

    const file = req.file;
    const originalname = req.file.originalname;
    file.originalname = Date.now() + "--" + file.originalname;

    try {
        const createdFile = storage.bucket(BUCKETNAME).file(file.originalname);
        const blobstream = createdFile.createWriteStream();

        blobstream.on('finish', async () => {
            const docRef = db.collection(FIRESTORENAME).doc(createdFile.id);
            const file_data = await get_file_information(createdFile);

            file_data.filename = originalname;
            file_data.owner = userInformation.name;
            file_data.rights = userInformation.courses;
            file_data.email = userInformation.email;

            if (req.body.password != null && req.body.password !== "") {
                file_data.password = await bcrypt.hash(req.body.password, 10);
            }

            await docRef.set(file_data);
            console.log("Upload Success");
        })
        blobstream.end(file.buffer);
        res.json({ message: "Upload Successful!" });

    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/dropdown", async (req, res) => {
    const right = [req.query.right];
    const query = db.collection(FIRESTORENAME);
    const querySnapshot = await query.get();
    const file_information = get_right_docs(querySnapshot, right);
    res.send(file_information);
})

app.route("/download").get(downloadFile).post(downloadFile);

// FUNCTIONS //

async function downloadFile(req, res) {
    const directoryPath = __dirname +"/uploads/";
    const filename = req.query.id;
    const options = { destination: directoryPath+filename };

    const docname = filename.replace(/\s/g, "%20");
    const docRef = db.collection(FIRESTORENAME).doc(docname);
    const doc = await docRef.get();

    if (!doc.empty && doc.data() != undefined) {
        await storage.bucket(BUCKETNAME).file(filename).download(options);

        res.download(directoryPath+filename, doc.data().filename, (err) => {
            if (err) {
                res.status(500).send({
                    message: "Could not download the file. " + err,
                });
                }
        });

        setTimeout(function() {
            fs.unlinkSync(directoryPath+filename);
        }, 1000);
    }
}

function getUserInformation(token) {
    const base64Url = token.split('.')[1];
    const decodedValue = JSON.parse(Buffer.from(base64Url, "base64").toString());
    const userInformation = {
        email: decodedValue.email,
        name: decodedValue.name,
        courses: decodedValue.courses.split(","),
    }
    return userInformation;
}

function get_right_docs(snapshot, rights) {
    let file_information = [];
    snapshot.forEach( (doc) => {
        let bool = true;
        doc.data().rights.forEach( (right) => {
            if (rights.includes(right) && bool) {
                file_information.push(doc.data());
                bool = false;
            }
        });
    });
    return file_information;
}

async function get_file_information(file, password="") {
    const metadata = (await file.getMetadata())[0];
    const date = new Date(metadata["updated"]).toLocaleString("en-US");

    var size = Number(metadata["size"]);
    var fileSize = size +" B";
    var file_information = {};

    if (size / 1000 > 1 && size / 1000 < 1000) { fileSize = (size / 1000).toFixed(2) +" KB"; }
    if (size / 1000000 > 1 && size / 1000000 < 1000) { fileSize = (size / 1000000).toFixed(2) +" MB"; }
    if (size / 1000000000 > 1) { fileSize = (size / 1000000000).toFixed(2) +" GB"; }

    file_information = {
        filename: "",
        file_id: file.id,
        owner: "",
        last_change: date,
        fileSize: fileSize,
        rights: "",
        password: password,
        email: "",
        public: VISIBILITY
    };
    
    return file_information;
}