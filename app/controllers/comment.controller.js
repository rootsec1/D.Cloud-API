const Comment = require('../models/comment.model');
const User = require('../models/user.model');

exports.create = (req, res) => {
    if(req.body.user && req.body.content && req.body.city && req.body.post_id) {
        User.findOne({ uid: req.body.user }, (errUser,dataUser)=>{
            if(errUser || !dataUser) sendData(errUser,dataUser,req,res);
            else {
                const comment = new Comment({
                    user: dataUser,
                    content: req.body.comment,
                    city: req.body.city,
                    post_id: req.body.post_id
                });
                comment.save((err,data)=>sendData(err,data,req,res));
            }
        });
    } else sendData('Missing params user/content/city',null,req,res);
};

exports.findAll = (req, res) => {
    if(req.query.post_id) Comment.find({ post_id: req.query.post_id }, (err,data)=>sendData(err,data,req,res));
};

exports.findOne = (req, res) => {
    Comment.findById(req.params.id, (err,data)=>sendData(err,data,req,res));
};

exports.update = (req, res) => {
    Comment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, (err,data)=>sendData(err,data,req,res));
};

exports.delete = (req, res) => {
    Comment.findByIdAndRemove(req.params.id, (err,data)=>sendData(err,data,req,res));
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