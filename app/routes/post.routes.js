module.exports = (app) => {
    const posts = require('../controllers/post.controller.js');
    app.post('/posts', posts.create);

    app.get('/posts', posts.findAll);

    app.get('/posts/:id', posts.findOne);

    app.put('/posts/:id', posts.update);

    app.delete('/posts/:id', posts.delete);
}