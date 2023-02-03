/**
 * the server is running as an "express" app
 * multer is for the file upload and download functions
 * crypto is to guarantee the security in the upload process
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require("fs");

// Firestore and Storage are the two google cloud databases.
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

// constants for the application
const VISIBILITY = true;
const FIRESTORENAME = "fileshare-firestore";
const BUCKETNAME = "studentshare-fileshare-bucket";
const PORT = process.env.PORT || 8080;

// initialize the main variables
const db = new Firestore();
const storage = new Storage();
const app = new express();

// Application Settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://website-dot-studentshare.ey.r.appspot.com",
    // origin: "*",
}));
app.listen(PORT, () => {
    console.log(`Student-Fileshare Rest API listening on port ${PORT}`);
});

// APPLICATION //

/**
 * 
 */
app.get('/files', async (req, res) => {
    // get all information from the jwt token and search for the firestore collection
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);
    const query = db.collection(FIRESTORENAME);
    const querySnapshot = await query.get();

    // if the query is empty don't show the frontend anything, else send all file information filtered with the rights of the user.
    if (querySnapshot.empty) {
        res.send([]);
    } else {
        const file_information = get_right_docs(querySnapshot, userInformation.courses);
        res.send(file_information);
    }
})

app.get("/owner", async (req, res) => {
    // get all information from the jwt token and search for the firestore collection
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);
    const email = req.query.email;
    var query = db.collection(FIRESTORENAME);

    // if the user who did the action is the same as the clicked one, then send all files available of the user.
    if (email == userInformation.email) {
        // get every file where the email is the same as the users email.
        const querySnapshot = await query.where("email", "==", email).get();
        if (!querySnapshot.empty) { res.json(get_right_docs(querySnapshot, userInformation.courses)); }
        else { res.json({ status: "You didn't upload any files!" }); }
    // else, show the user all the files from that clicked user, where the rights overlap and a public flag is set.
    } else {
        // get every file where the email is the same as the users email and the public flag is set true.
        const querySnapshot = await query.where("email", "==", email).where("public", "==", true).get();
        if (get_right_docs(querySnapshot, userInformation.courses).length > 0) { res.json(get_right_docs(querySnapshot, userInformation.courses)); }
        else { res.json({ status: "You don't have the rights!" }); }
    }
});

app.post("/delete", async (req, res) => {
    // get all information from the jwt token
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);

    // search for the request document, but change blank space with %20 to get the right id of the files.
    const filename = req.query.docname;
    const docname = filename.replace(/\s/g, "%20");
    const doc = await db.collection(FIRESTORENAME).doc(docname).get();

    // if the document is defined and the user is the owner of the file, delete the file from the bucket
    if (doc.data() != undefined && doc.data().email == userInformation.email) {
        await storage.bucket(BUCKETNAME).file(filename).delete()
            .then(response => {
                console.log("Successful deleted File from bucket!");
            }).catch(error => {
                console.log("Couldn't delete this File from the bucket!");
                res.status(500).send();
                return;
            });
        // after that delete the document from the firestore collection
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
    // get all information from the jwt token
    const googleToken = req.query.token;
    const userInformation = getUserInformation(googleToken);

    // get the file from the request via multer and give the file a unique id
    const file = req.file;
    const originalname = req.file.originalname;
    file.originalname = Date.now() + "--" + file.originalname;

    try {
        // save the file space for the given filename.
        const createdFile = storage.bucket(BUCKETNAME).file(file.originalname);
        const blobstream = createdFile.createWriteStream();

        // upload the file into that saved space.
        blobstream.on('finish', async () => {
            // create a document with the same name as the file
            const docRef = db.collection(FIRESTORENAME).doc(createdFile.id);
            // give the document all file information
            const file_data = await get_file_information(createdFile);

            // give the document all owner information
            file_data.filename = originalname;
            file_data.owner = userInformation.name;
            file_data.rights = userInformation.courses;
            file_data.email = userInformation.email;

            // add a password to the file when given from the frontend
            if (req.body.password != null && req.body.password !== "") {
                file_data.password = await bcrypt.hash(req.body.password, 10);
            }

            // save the document into the collection
            await docRef.set(file_data);
            console.log("Upload Success");
        })
        blobstream.end(file.buffer);
        res.json({ message: "Upload Successful!" });

    } catch (error) {
        res.status(500).send(error);
    }
})

// filter the files with the right choosen from the user and send them back.
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
    // set the download path and filename
    const directoryPath = __dirname +"/uploads/";
    const filename = req.query.id;
    const options = { destination: directoryPath+filename };

    // search for the document of the file.
    const docname = filename.replace(/\s/g, "%20");
    const docRef = db.collection(FIRESTORENAME).doc(docname);
    const doc = await docRef.get();

    // if the document is defined download the file from the storage
    if (!doc.empty && doc.data() != undefined) {
        // download it local to the upload folder.
        await storage.bucket(BUCKETNAME).file(filename).download(options);

        // send the file to the user.
        res.download(directoryPath+filename, doc.data().filename, (err) => {
            if (err) {
                res.status(500).send({
                    message: "Could not download the file. " + err,
                });
                }
        });

        // delete it from the local upload folder.
        setTimeout(function() {
            fs.unlinkSync(directoryPath+filename);
        }, 1000);
    }
}

/**
 * Function to extract all information from the jwt token.
 * 
 * @param {*} token is the jwt token from requested user
 * @returns the user information extracted from the jwt token
 */
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

/**
 * Function to get only the available files filtered with the rights.
 * 
 * @param {*} snapshot is the snapshot of the collection.
 * @param {*} rights are the rights to filter the files with.
 * @returns an array of file information filter with given rights.
 */
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

/**
 * Function to create a file information object with alle file information in it.
 * 
 * @param {*} file is the file object
 * @param {*} password is the possible password the user can give the uplaoded file for example
 * @returns an file information object
 */
async function get_file_information(file, password="") {
    const metadata = (await file.getMetadata())[0];
    const date = new Date(metadata["updated"]).toLocaleString("en-US");

    // calculate the right presentation of the file size for the frontend.
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