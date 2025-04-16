const mongoose = require('mongoose');

const addCategorySchema = new mongoose.Schema(
  {
    model_name: {
      type: String,
      required: true,
    },
    range: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AddCategory = mongoose.model('AddCategory', addCategorySchema);

module.exports = AddCategory;
