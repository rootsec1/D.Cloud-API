module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    app.post('/users', users.create);

    app.get('/users', users.findAll);

    app.get('/users/:uid', users.findOne);

    app.put('/users/:uid', users.update);

    app.delete('/users/:uid', users.delete);
}