/***********************************************************************************
 *! Default index
 ***********************************************************************************/

/**
 * Creates the categories HTML based on the provided categories data.
 */
function createCategories(categories) {
    const galleryTitle = document.querySelector(".gallery-title");
    const categoriesForm = document.createElement("form");

    categories.forEach((category) => {
        const categoryId = category.id;
        const categoryName = category.name;
        const kebabCasedCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const checkedAttribute = getCategoryCheckedAttribute(categoryId);
        const categoryInput = `
            <input class="button-input" type="radio" name="category" id="${kebabCasedCategoryName}" data-id="${categoryId}" ${checkedAttribute}>
            <label class="button-input" for="${kebabCasedCategoryName}">${categoryName}</label>
        `;
        categoriesForm.insertAdjacentHTML("beforeend", categoryInput);
    });
    
    galleryTitle.insertAdjacentElement("afterend", categoriesForm);
    setupCategoryEvents(categoriesForm);
}

/**
 * Determines the checked attribute for a category input based on saved state.
 */
function getCategoryCheckedAttribute(categoryId) {
    let savedCategoryId = localStorage.getItem("selectedCategoryId");
    if (!savedCategoryId) {
        savedCategoryId = "0";
        localStorage.setItem("selectedCategoryId", savedCategoryId);
    }
    return savedCategoryId === categoryId.toString() ? "checked" : "";
}

/**
 * Sets up the change event listener on the categories form to handle category selection.
 */
function setupCategoryEvents(categoriesForm) {
    categoriesForm.addEventListener("change", async function (event) {
        const works = await loadWorksData();
        let selectedCategoryId = event.target.getAttribute("data-id");
        localStorage.setItem("selectedCategoryId", selectedCategoryId);
        createFilteredGallery(works, selectedCategoryId);
    });
}

/**
 * Creates the gallery HTML based on the provided works data.
 */
function createGallery(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    works.forEach((work) => {
        const galleryItem = `
            <article>
                <figure>
                    <img src="${work.imageUrl}" alt="${work.title}" data-work-id="${work.id}">
                    <figcaption>${work.title}</figcaption>
                </figure>
            </article>
        `;
        gallery.insertAdjacentHTML("beforeend", galleryItem);
    });
}

/**
 * Filters the works based on the selected category and creates the gallery accordingly.
 */
async function createFilteredGallery(works, categoryId) {
    if (categoryId === null || categoryId === "0") {
        createGallery(works);
    } else {
        const filteredWorks = works.filter((work) => work.category.id.toString() === categoryId);
        createGallery(filteredWorks);
    }
}
