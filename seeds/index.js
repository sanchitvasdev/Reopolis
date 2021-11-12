const mongoose = require('mongoose');
const apartments = require('./apartments');
const Apartment = require('../models/apartment');

mongoose.connect('mongodb://localhost:27017/reopolis', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected')
});

const seedDB = async () => {
    await Apartment.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20000 + 10000);
        const apart = new Apartment({
            author: '61658d6b637f467c8d36d798',
            title: `${apartments[random].names}`,
            price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda culpa impedit repellat vero vel dolores id maiores distinctio ab, quidem dolore consequatur soluta totam? Rem fugiat saepe accusamus molestias deserunt.',
            location: `${apartments[random].city}, ${apartments[random].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnuompa9x/image/upload/v1634135516/Reopolis/god02duj1uxirrnc6rds.jpg',
                    filename: 'Reopolis/god02duj1uxirrnc6rds.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/dnuompa9x/image/upload/v1634135516/Reopolis/egsycdkn4czb880bf103.jpg',
                    filename: 'Reopolis/egsycdkn4czb880bf103.jpg'
                }
            ]
        })
        await apart.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})