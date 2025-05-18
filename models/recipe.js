import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    favoritedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    description: {
        type: String,
    },
    ingredients: [{
        type: String,
        required: true,
    }],
    steps: [{
        type: String,
        required: true,
    }],
    cusine: {
        type: String,
        required:true
    }
}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;