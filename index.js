const ipfsApi = require('ipfs-api');
const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://musicx-46c2d.firebaseio.com'
});
const databaseRef = admin.database().ref('ipfs');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const ipfs = ipfsApi('0.0.0.0');
const port = 6942;
const app = express();

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res)=>res.sendFile(__dirname+'/index.html'));

app.post('/upload_file', (req,res)=>{
    const uid = req.query.uid;
    const file = req.files.foo;
    ipfs.files.add(Buffer.from(file.data), (errIpfs,result)=>{
        console.log("RESULT: "+JSON.stringify(result));
        result = result[0];
        const fileName = file.name;
        const fileSize = result.size;
        const fileType = file.mimetype;
        const jsonToPush = {
            name: fileName,
            size: fileSize,
            type: fileType
        };
        file.mv(__dirname+'/data/'+uid+'_'+fileName, errMv=>{
            databaseRef.child(uid).child(result.hash).set(jsonToPush)
            .catch(errFb=>sendData(errFb,null,req,res))
            .then(()=>sendData(errIpfs||errMv,result,req,res))
        });
    });
});

app.get('/get_file', (req,res)=>{
    const uid = req.query.uid;
    const hash = req.query.hash;
    databaseRef.child(uid).child(hash).once('value', snapshot=>{
        const fileName = snapshot.val().name;
        const fileType = snapshot.val().type;
        const fileSize = snapshot.val().size;
        const filePath = __dirname+'/data/'+uid+'_'+fileName;
        res.setHeader('Content-Type',fileType);
        res.setHeader('Content-Length',fileSize);
        res.sendFile(filePath);
    }).catch(err=>sendData(err,null,req,res));
});

app.listen(port, '0.0.0.0', ()=>{
    console.log('[SERVER] Listening on port '+port);
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