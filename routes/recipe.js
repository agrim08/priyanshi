import express from "express";
import Recipe from "../models/recipe.js";
import { userAuth } from "../middleware/userAuth.js";

const recipeRouter = express.Router();

recipeRouter.post("/add_recipe", userAuth, async (req, res) => {
  const { name, imageUrl, description, ingredients, steps, cusine } = req.body;
  if (!name  || !ingredients || !steps || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!Array.isArray(ingredients) || !Array.isArray(steps) || ingredients.length === 0 || steps.length === 0) {
    return res.status(400).json({ error: "Ingredients and steps must be non-empty arrays" });
  }
  try {
    const recipe = new Recipe({ name, imageUrl, description, ingredients, steps, cusine });
    await recipe.save();
    return res.status(201).json({ message: "Recipe added successfully", data: recipe._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

recipeRouter.get("/get_recipe", userAuth, async (req, res) => {
  try {
    const cusine = req.query.cusine;
    let query = {};
    if (cusine && cusine.trim() !== '') {
      query.cusine = { $regex: new RegExp(`^${cusine.trim()}$`, 'i') };
    }
    const recipes = await Recipe.find(query).select('-favoritedBy');
    const userFavoriteRecipes = req.user.favoriteRecipes.map(id => id.toString());
    const recipesWithFavorite = recipes.map(recipe => ({
      ...recipe.toObject(),
      isFavorite: userFavoriteRecipes.includes(recipe._id.toString())
    }));
    return res.status(200).json(recipesWithFavorite);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

recipeRouter.get("/get_favorite_recipes", userAuth, async (req, res) => {
  try {
    await req.user.populate({
      path: 'favoriteRecipes',
      select: '-favoritedBy'
    });
    const favoriteRecipes = req.user.favoriteRecipes.map(recipe => ({
      ...recipe.toObject(),
      isFavorite: true
    }));
    return res.status(200).json(favoriteRecipes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

recipeRouter.post("/favorite_recipe/:recipe_id", userAuth, async (req, res) => {
  const recipeId = req.params.recipe_id;
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    if (req.user.favoriteRecipes.includes(recipeId)) {
      return res.status(400).json({ error: "Recipe already favorited" });
    }
    req.user.favoriteRecipes.push(recipeId);
    recipe.favoritedBy.push(req.user._id);
    await req.user.save();
    await recipe.save();
    return res.status(200).json({ message: "Recipe added to favorites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default recipeRouter;