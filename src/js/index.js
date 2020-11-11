import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/SearchView';
import * as recipeView from './views/RecipeView';
import * as listView from './views/ListView';
import * as likesView from './views/LikesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** 
 * Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked object
 */
const state = {};
window.state = state;

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
			recipeView.renderRecipe(
				state.recipe,
				state.likes.isLiked(id)
			);
		} catch (error) {
			console.log(error);
			alert('Error processing recipe');
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
*/
const controlList = () => {
	// Create a new list IF there in none yet
	if (!state.list) state.list = new List();

	// Add each ingredient to the list and UI
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
};

// Handle delete and update list items events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;
	// Handle the delete button
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// Delete from state
		state.list.deleteItem(id);

		// Delete from UI
		listView.deleteItem(id);

		// Handle the count update
	} else if (e.target.matches('.shopping__value')) {
		const val = parseFloat(e.target.value);
		state.list.updateCount(id, val);
	}
});


/**
 * LIKE CONTROLLER
*/
const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currentID = state.recipe.id;

	// User has NOT yet liked current recipe
	if (!state.likes.isLiked(currentID)) {
		// Add like to the state
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img,
		);

		// Toggle the like button
		likesView.toggleLikeBtn(true);

		// Add like to UI list
		likesView.renderLike(newLike);

		// User HAS liked current recipe
	} else {
		// Remove like to the state
		state.likes.deleteLike(currentID);

		// Toggle the like button
		likesView.toggleLikeBtn(false);

		// Remove like from UI list
		likesView.deleteLike(currentID);
	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page loader
window.addEventListener('load', () => {
	state.likes = new Likes();
	state.likes.readStorage();
	state.likes.likes.forEach(like => likesView.renderLike(like))
})


// Handling recipe button click
elements.recipe.addEventListener('click', e => {
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		// decrease servings
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// increase servings
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		// Add ingredients to the shopping list
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Like controller
		controlLike();
	}
});
