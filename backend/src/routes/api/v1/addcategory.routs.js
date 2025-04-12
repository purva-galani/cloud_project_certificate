const express = require('express');
const router = express.Router();
const addCategoryController = require('../../../controller/addcategory.controller');

router.post('/addnewCategory', addCategoryController.addNewCategory);
router.get('/getCategories', addCategoryController.getCategories);
router.put('/updateCategory', addCategoryController.updateCategory);
router.delete('/deleteCategory/:id', addCategoryController.deleteCategory);
    
module.exports = router;
