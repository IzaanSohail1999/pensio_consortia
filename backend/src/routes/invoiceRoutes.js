const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
    createInvoice,
    getAllInvoices,
    getOneInvoice,
    updateInvoice,
    deleteInvoice
    } = require('../controllers/invoiceController')

router.post('/create', upload.single('screenshot'), createInvoice);
router.get('/getAllInvoices', getAllInvoices)
router.get('/:id', getOneInvoice)
router.put('/id/:id', upload.single('screenshot'), updateInvoice);
router.delete('/id/:id', deleteInvoice);

module.exports = router;