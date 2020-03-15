require('../config/config')
const roles				= require("../helpers/roles"),
	authorize			= require("../helpers/authorize"),
    {Router}          	= require('express'),
	{MongoClient}   	= require('mongodb'),
	assert				= require('assert'),
	axios				= require('axios'),
	qs					= require('qs')
	

const dbClient = new MongoClient(process.env.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true})
dbClient.connect()
const router = Router()

router.post("/pay", authorize(roles.cardHolder), async (req, res) => {
	const {amount, currency, title} = req.body
	try {
		assert(!isNaN(Number(amount)))
		assert.equal(typeof currency, "string")
	} catch (err) {
		console.log(err)
		return res.status(400).json({ status: 400, message: "bad request"})
	}

	try {
		const users = dbClient.db('areeba').collection('users')
	
		const userProfile = await users.findOne({
			email: req.user.email
		})

		console.log(userProfile)
	
		const areebaPayment = await axios({
			method: 'post',
			url: 'https://api.areeba.com/transfer/hackathon/pay',
			data: JSON.stringify({
				merchantId: "TEST222204858001",
				apiPassword: "60f2e352f77cb65ae57d05c2191a27e9",
				amount: req.body.amount,
				currency: req.body.currency,
				...userProfile.card
			}),
			headers: {
				'content-type': 'application/json',
				Authorization: userProfile.oAuthToken,
				Accept: 'application/vnd.areeba.request+json; version=2.0'
			}
		})

		if (areebaPayment.data.result !== "SUCCESS") {
			console.warn("failed payment:", areebaPayment)
			return res.status(400).json({status: 400, message: "failed to make payment"})
		}
		
		users.findOneAndUpdate({email: req.user.email}, {
			$push: {
				payments: {
					amount,
					title,
					currency,
					time: new Date().getTime() //store epoch time in milliseconds
				}
			}
		},
		(err, result) => {
			if (err) {
				console.error(err)
				return res.status(500).json({status: 500, message: "internal server error"})
			}
			if (result.value)
				return res.status(200).json({status: 201, message: "payment successfull"})
			return res.status(400).json({status: 400, message: "couldn't make payment"})
		})
	} catch (e) {
		console.error(e)
		return res.status(500).json({status: 500, message: "internal server error, could't make payment"})
	}
})

module.exports = router