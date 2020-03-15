require('./config/config')
const bodyParser		= require('body-parser'),
	cors				= require('cors'),
	express				= require('express'),
	{MongoClient}		= require('mongodb'),
	paymentsRouter		= require("./routers/payments"),
	usersRouter			= require("./routers/users")

const app = express()
const dbClient = new MongoClient(process.env.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true})
dbClient.connect().then(() => dbClient.db("areeba").collection("users").createIndex({ "email": 1 }, { unique: true }, (err, result) => {
	if (err)
		console.error(err)
}))

app.disable('x-powered-by')
app.use(bodyParser.json({
	limit: '10mb',
	parameterLimit: 1000000
})) // 1024*1024*5 support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '10mb',
	parameterLimit: 1000000, // 1024*1024*20
}))

//override default error handling middleware
app.use((error, req, res, next) => {
	if (error instanceof SyntaxError) {
		console.error(error)
		res.status(400).end()
	} else {
		next()
	}
})
app.use(cors())

app.use(usersRouter)
app.use(paymentsRouter)

app.listen(process.env.LISTENER_PORT, () => console.log(`Server running on port ${process.env.LISTENER_PORT}`))