const express = require('express');
const router = express.Router();
const { 
        registerAdmin, 
        loginAdmin, 
        getAllAdmins, 
        getOneAdmin, 
        updateAdmin, 
        deleteAdmin 
    } = require('../controllers/adminController');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/getAllAdmins', getAllAdmins)
router.get('/:username', getOneAdmin)
router.put('/username/:username', updateAdmin);
router.delete('/username/:username', deleteAdmin);

module.exports = router;