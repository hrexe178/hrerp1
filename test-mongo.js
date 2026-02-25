const mongoose = require('mongoose');

const uri = 'mongodb://vysoftware91_db_user:8f8VusqwK8pldu2R@ac-qpobq7c-shard-00-00.tm8evwf.mongodb.net:27017,ac-qpobq7c-shard-00-01.tm8evwf.mongodb.net:27017,ac-qpobq7c-shard-00-02.tm8evwf.mongodb.net:27017/hr-erp?ssl=true&replicaSet=atlas-s12eob-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to tm8evwf.mongodb.net MongoDB manually');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
