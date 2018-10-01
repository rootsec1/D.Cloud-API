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
const config = require('./config');
const mongoose = require('mongoose');
const request = require('request');

mongoose.Promise = global.Promise;
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res)=>{
    if(req.query.hash) request('http://127.0.0.1:8080/ipfs/'+req.query.hash).pipe(res);
    else res.sendFile(__dirname+'/index.html')
});

app.get('/all', (req,res)=>{
    const dataToSend = [];
    databaseRef.once('value', rootSnapshot=>{
        rootSnapshot.forEach(userSnapshot=>{
            userSnapshot.forEach(fileSnapshot=>{
                const fileHash = fileSnapshot.key;
                const fileObj = fileSnapshot.val();
                fileObj.hash = fileHash;
                dataToSend.push(fileObj);
            });
        });
        sendData(null,dataToSend,req,res);
    }).catch(err=>sendData(err,null,req,res));
});

app.get('/list_files', (req,res)=>{
    const uid = req.query.uid;
    const dataToSend = [];
    databaseRef.child(uid).once('value',snapshot=>{
        snapshot.forEach(fileSnapshot=>{
            const fileHash = fileSnapshot.key;
            const fileObj = fileSnapshot.val();
            fileObj.hash = fileHash;
            dataToSend.push(fileObj);
        });
        sendData(null,dataToSend,req,res);
    }).catch(err=>sendData(err,null,req,res));
});

app.post('/upload_file', (req,res)=>{
    const uid = req.query.uid;
    const file = req.files.foo;
    ipfs.files.add(Buffer.from(file.data), (errIpfs,result)=>{
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

app.get('/get', (req,res)=>{
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


//require('./app/routes/user.routes')(app);
//require('./app/routes/comment.routes')(app);
//require('./app/routes/post.routes')(app);
app.listen(port, '0.0.0.0', ()=>{
    console.log('[SERVER] Listening on port '+port);
    /*
    mongoose.connect(config.dbUrl, { useNewUrlParser: true })
    .catch(err=>{
        console.log('[!IPFS-ERR] '+err);
        process.exit();
    }).then(()=>{
        console.log('[IPFS] Succesfully connected to IPFS DB');
    });
    */
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