const express = require('express')
const router = express.Router()
const salesforceService = require('../services/salesforceService')

//expnse routes
router.get('/', salesforceService.getExpenses)
router.post('/', salesforceService.createExpense)
router.put('/:id', salesforceService.updateExpense)
router.delete('/:id', salesforceService.deleteExpense)
module.exports = router