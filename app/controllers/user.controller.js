const User = require('../models/user.model');

exports.create = (req, res) => {
    if(req.body.name && req.body.uid && req.body.image) {
        const user = new User({
            uid: req.body.uid,
            name: req.body.name,
            image: req.body.image
        });
        user.save((err,data)=>sendData(err,data,req,res));
    } else sendData('Missing params UID/Name/image',null,req,res);
};

exports.findAll = (req, res) => {
    User.find({}, (err,data)=>sendData(err,data,req,res));
};

exports.findOne = (req, res) => {
    User.findOne({ uid: req.params.uid }, (err,data)=>sendData(err,data,req,res));
};

exports.update = (req, res) => {
    User.findOneAndUpdate({ uid: req.params.uid }, { $set: req.body }, { new: true }, (err,data)=>sendData(err,data,req,res));
};

exports.delete = (req, res) => {
    User.findOneAndRemove({ uid: req.params.uid }, (err,data)=>sendData(err,data,req,res));
};

function sendData(err,data,req,res) {
    if(err) {
        res.status(500).json({ err });
        console.log(err);
    } else {
        res.status(200).json(data);
        console.log(new Date(), req.url);
    }
}