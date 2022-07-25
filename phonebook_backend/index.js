require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { request } = require('http')


const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :param'),)

morgan.token('param', function (req, res, param) {
    return JSON.stringify(req.body);
});


const Info = (count) => {
    return (
        `<div>
        <h2>Phonebook has info for ${count} people</h2>
        <h2>${new Date}</h2>
        </div>`
    )
}
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/info', (request, response) => {
    Person.count().then((count) => {
        response.send(Info(count))
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {

    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, respone, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            respone.json(updatedPerson)
        })
        .catch(error => next(error))
})

const generateId = () => {
    const randomId = Math.floor(Math.random() * 100000000)
    return randomId
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({ error })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})