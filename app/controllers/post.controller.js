const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.create = (req, res) => {
    if(req.body.user && req.body.content && req.body.city) {
        User.findOne({ uid: req.body.user }, (errUser,dataUser)=>{
            if(errUser || !dataUser) sendData(errUser,dataUser,req,res);
            else {
                const post = new Post({
                    user: dataUser,
                    content: req.body.content,
                    city: req.body.content,
                    comments: [],
                    image: req.body.image? req.body.image : '',
                    video: req.body.video? req.body.video : '',
                    audio: req.body.audio? req.body.audio : ''
                });
                post.save((err,data)=>sendData(err,data,req,res));
            }
        });
    } else sendData('Missing params user/content/city',null,req,res);
};

exports.findAll = (req, res) => {
    if(req.query.city) Post.find({ city: req.query.city }, (err,data)=>sendData(err,data,req,res));
    else Post.find({}, (err,data)=>sendData(err,data,req,res));
};

exports.findOne = (req, res) => {
    Post.findById(req.params.id, (err,data)=>sendData(err,data,req,res));
};

exports.update = (req, res) => {
    Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, (err,data)=>sendData(err,data,req,res));
};

exports.delete = (req, res) => {
    Post.findByIdAndRemove(req.params.id, (err,data)=>sendData(err,data,req,res));
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