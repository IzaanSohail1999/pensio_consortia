const express = require('express');
const router = express.Router();
const {
        registerUser, 
        loginUser, 
        getAllUsers, 
        getOneUser, 
        updateUser, 
        deleteUser
    } = require('../controllers/userController')

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getAllUsers', getAllUsers)
router.get('/:username', getOneUser)
router.put('/username/:username', updateUser);
router.delete('/username/:username', deleteUser);

module.exports = router;