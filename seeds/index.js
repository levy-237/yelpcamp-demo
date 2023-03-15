const campground = require("../models/campground")
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
  .then(() => {
    console.log('MONGO ITS RUNNING');
  })
  .catch((err) => {
    console.log("oh no monginio")
    console.log(err)
  });

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 1; i++) {
    const price = Math.floor(Math.random() * 20) + 10
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new campground({
      author: "64010f3b40f3705e50ecf900",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: "The term camp comes from the Latin word campus, meaning . Therefore, a campground consists typically of open pieces of ground where a camper can pitch a tent or park a camper. More specifically a campsite is a dedicated area set aside for camping and for which often a user fee is charged.",
      price,
      geometry: { type: 'Point',
       coordinates: [ cities[random1000].longitude,
                      cities[random1000].latitude 
         ] 
         },
      images: [
        {
          url: 'https://res.cloudinary.com/dgcb6jium/image/upload/v1678483356/YelpCamp/e3ltvh5p1qi9y5jwkklz.png',
          filename: 'YelpCamp/e3ltvh5p1qi9y5jwkklz',
        }
      ]

    })
    await camp.save();
  }
}
seedDB()
  .then(() => {
    mongoose.connection.close()
  })