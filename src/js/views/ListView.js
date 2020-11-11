import { elements } from './base';

export const renderItem = item => {
	const html = `
		<li class="shopping__item" data-itemId="${item.id}">
				<div class="shopping__count">
						<input type="number" value="${item.count}" step="${item.count}" class="shopping__value">
						<p>${item.unit}</p>
				</div>
				<p class="shopping__description">${item.ingredient}</p>
				<button class="shopping__delete btn-tiny">
						<svg>
								<use href="img/icons.svg#icon-circle-with-cross"></use>
						</svg>
				</button>
		</li>
	`;
	elements.shopping.insertAdjacentHTML('beforeend', html);
};

export const deleteItem = id => {
	const item = document.querySelector(`[data-itemId="${id}"]`);
	if(item) item.parentElement.removeChild(item);
};
