const AddCategory = require('../model/addcategory.model');
const mongoose = require("mongoose");

const addNewCategory = async (req, res) => {
  try {
    const { model_name, range } = req.body;

    const existingCategory = await AddCategory.findOne({ model_name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Model already exists' });
    }

    const newCategory = new AddCategory({ model_name, range });
    await newCategory.save();

    return res.status(201).json({
      message: `New model and range added: ${model_name} with range: ${range}`,
      data: newCategory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add model and range' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await AddCategory.find();
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const updateCategory = async (req, res) => {
  const { id, model_name, range } = req.body;

  try {
    const updatedCategory = await AddCategory.findByIdAndUpdate(
      id,
      { model_name, range },
      { new: true } 
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: `Category updated: ${model_name}`,
      data: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
      const { id } = req.params; 

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid category ID" });
      }

      const deletedCategory = await AddCategory.findByIdAndDelete(id);

      if (!deletedCategory) {
          return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addNewCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
