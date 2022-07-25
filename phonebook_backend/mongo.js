const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('Something went wrong when inputting the arguments')
  process.exit(1)
}

const password = process.argv[2]
const person_name = process.argv[3]
const person_num = process.argv[4]

const url = `mongodb+srv://objorkgr:${password}@cluster0.vd04xqz.mongodb.net/?retryWrites=true&w=majority`


const personSchema = new mongoose.Schema({
  name: String,
  number: String

})

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to Mongo')
  })
  .catch((err) => console.log(err))

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {

  const person = new Person({
    name: person_name,
    number: person_num
  })
  person.save().then(result => {
    console.log(`Added ${person.name} number ${person_num} to phonebook`)
    mongoose.connection.close()
  })
}

else {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => { console.log(`${person.name} ${person.number}`) })
    mongoose.connection.close()
  })
}
