const ipfsApi = require('ipfs-api');
const admin = require('firebase-admin');
const database = admin.database().ref('ipfs');
const express = require('express');
const bodyParser = require('body-parser');
const serviceAccount = require('./service_account.json');
const ipfs = ipfsApi('0.0.0.0');
const port = 6942;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/upload', (req,res)=>{
    const uid = req.query.uid;
    const fileUrl = req.query.url;
    ipfs.files.add(fileUrl, (err,result)=>{
        database.child(uid).child(result).set(fileUrl)
        .catch(err=>sendData(err,null,req,res))
        .then(()=>sendData(err,result,req,res));
    });
});

app.listen(port, '0.0.0.0', ()=>{
    console.log('[SERVER] Listening on port '+port);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://musicx-46c2d.firebaseio.com'
    });
});

function sendData(err,data,req,res) {
    if(err) {
        res.status(500).json({ err });
        console.log(err);
    } else {
        res.status(200).json(data);
        console.log(new Date(), req.url);
    }
}