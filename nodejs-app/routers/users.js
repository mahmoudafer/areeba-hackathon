require('../config/config')
const bcrypt			= require('bcrypt'),
	{MongoClient}		= require('mongodb'),
	jwt					= require("jsonwebtoken"),
    roles				= require("../helpers/roles"),
	{Router}          	= require('express'),
	authorize          	= require("../helpers/authorize"),
	assert				= require('assert'),
	qs = require('qs'),
	axios = require('axios')

const dbClient = new MongoClient(process.env.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true})
dbClient.connect()

const router = Router()

router.post('/login', async (req, res) => {
    if (!(req.body.email && req.body.password)) {
		return res.status(400).json({ status: 400, message: "email or password not provided" })
	}
	const users = dbClient.db('areeba').collection('users')
	try {
		const profile = await users.findOne({
			email: req.body.email
		})

		if (!profile) {
			return res.status(404).json({status: 404, message: "Email not registered"})
		}

		bcrypt.compare(req.body.password, profile.password, (err, result) => {
			if (err) {
				console.error(err)
				throw "Error in signing in"
			}

			if (!result)
				return res.status(403).json({status: 403, message: "wrong password"})
			const authToken = jwt.sign({ email: req.body.email, role: roles.cardHolder }, process.env.TOKEN_SECRET)
			const {password, role, ...filteredProfile} = profile // remove password and role from the returned profile
			res.status(200).json({ status: 200, message: "signed in successfully", profile: {
				...filteredProfile
			}, authToken})
		})
	} catch (err) {
		res.status(500).json({status: 500, message: err})
	}
})

router.post('/signup', async (req, res) => {

    if (!(req.body.email && req.body.password && req.body.name && req.body.phone)) {
        return res.status(400).json({ status: 400, message: "missing required fields" })
	}
	
	const users = dbClient.db('areeba').collection('users')
	const {email, password, name, phone} = req.body

	bcrypt.hash(password, 10, async (err, hash) => {
		if (err) {
			console.error(err)
			return res.status(500).json({ status: 500, message: "Error creating account" })
		}
		try {
			const oAuthRes = await axios({
				method: 'post',
				url: 'https://api.areeba.com/oauth2/token',
				data: qs.stringify({
					grant_type: 'client_credentials',
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
					Authorization: 'Basic TjJndmVGTUxJTjhEa1I2VVNHZVZtdUV2d2NFYTpQaDRla3pJUmxGWmdJOFVqalFLQnhyc1Y1NW9h'
				}
			})
			await users.insertOne({
				email,
				password: hash,
				name,
				phone,
				role: roles.cardHolder,
				card: {},
				payments: [],
				oAuthToken: oAuthRes.data.token_type + " " + oAuthRes.data.access_token
			})
		} catch (err) {
			console.error(err)
			return res.status(302).json({ status: 302, message: "Email already exists" })
		}
		const authToken = jwt.sign({ email: email, role: roles.cardHolder }, process.env.TOKEN_SECRET)
		res.status(201).json({ status: 201, message: "Email registered successfully", authToken, profile: {
			name,
			email,
			phone,
			card: {},
			history: []
		}})
	})
})

router.put('/card', authorize(roles.cardHolder), (req, res) => {
	
	const {cardNumber, cardCVV, cardName, expiryMM, expiryYY} = req.body
	try {
		assert.equal(typeof cardNumber, "string")
		assert.equal(typeof cardName, "string")
		assert.equal(typeof cardCVV, 'string')
		assert.equal(typeof expiryMM, 'string')
		assert.equal(typeof expiryYY, 'string')
	} catch (err) {
		return res.status(400).json({ status: 400, message: "bad request"})
	}

	const users = dbClient.db('areeba').collection('users')
	users.findOneAndUpdate({email: req.user.email}, {
		$set: {
			card: {
				cardNumber,
				cardCVV,
				cardName,
				expiryMM,
				expiryYY
			}
		}
	},
	(err, result) => {
		if (err) {
			console.error(err)
			return res.status(500).json({status: 500, message: "internal server error"})
		}
		if (result.value)
			return res.status(200).json({status: 200, message: "card updated successfully"})
		return res.status(400).json({status: 400, message: "couldn't update card details"})
	})
})

module.exports = router