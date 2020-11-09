import Search from './models/Search';
import * as searchView from './views/SearchView';
import * as recipeView from './views/RecipeView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked object
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
	// 1. Get query from view
	const query = searchView.getInput();

	if (query) {
		// 2. New search object and add to state
		state.search = new Search(query);

		// 3. Prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		// 4. Search for recipes
		await state.search.getResults();

		// 5. Render results on UI
		clearLoader();
		searchView.renderResults(state.search.result.recipes);
	}
};

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

// FOR TESTING - TO REMOVE LATER //TODO
window.addEventListener('load', e => {
	e.preventDefault();
	controlSearch();
});

elements.resPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	const gotoPage = +btn.dataset.goto;

	searchView.clearResults();
	searchView.renderResults(state.search.result.recipes, gotoPage);
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
	// Get ID from url
	const id = window.location.hash.replace('#', '');
	if (id) {
		// Prepare UI for changes
		renderLoader(elements.recipe);

		// Hightlight selected search item
		if (state.search) searchView.hightlightSelected(id);
		

		// Create new recipe object
		state.recipe = new Recipe(id);

		try {
			// Get recipe data and parse ingredients
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			// Calculate servings and time
			state.recipe.calcTime();
			state.recipe.calcServings();

			// Render recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe);
		} catch (error) {
			alert('Error processing recipe');
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
