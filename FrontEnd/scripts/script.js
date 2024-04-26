/**
 * Fetches gallery data from the server and initializes the gallery view.
 */
async function loadGallery() {
    let galleryData = localStorage.getItem("originalWorks");
    if (!galleryData) {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            galleryData = await response.json();
            localStorage.setItem("originalWorks", JSON.stringify(galleryData));
        } catch (error) {
            console.error("Error fetching gallery data:", error);
        }
    } else {
        galleryData = JSON.parse(galleryData);
    }
    return galleryData;
}

/**
 * Fetches categories data from the server and initializes the categories section.
 */
async function loadCategories() {
    let categoriesData = localStorage.getItem("originalCategories");
    if (!categoriesData) {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            categoriesData = await response.json();
            categoriesData.unshift({ id: 0, name: "Tous" });
            localStorage.setItem("originalCategories", JSON.stringify(categoriesData));
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    } else {
        categoriesData = JSON.parse(categoriesData);
    }
    return categoriesData;
}

/**
 * Creates the gallery HTML based on the provided works data.
 */
function createGallery(galleryWorks) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    galleryWorks.forEach((work) => {
        const galleryContent = `
                <figure>
                    <img src="${work.imageUrl}" alt="${work.title}">
                    <figcaption>${work.title}</figcaption>
                </figure>
            `;
        gallery.insertAdjacentHTML("beforeend", galleryContent);
    });
}

/**
 * Creates the categories HTML based on the provided categories data.
 */
function createCategories(categoryElements) {
    const portfolioTitle = document.querySelector("#portfolio h2");
    const portfolioCategoriesForm = document.createElement("form");
    setCheckedAttribute(portfolioCategoriesForm);

    categoryElements.forEach((category) => {
        const kebabCasedCategoryName = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const checkedAttribute = getCheckedAttribute(category.id);
        const portfolioCategories = `
        <input type="radio" name="category" id="${kebabCasedCategoryName}" data-id="${category.id}" ${checkedAttribute}>
        <label class="button-input" for="${kebabCasedCategoryName}">${category.name}</label>
        `;
        portfolioCategoriesForm.insertAdjacentHTML("beforeend", portfolioCategories);
    });
    portfolioTitle.insertAdjacentElement("afterend", portfolioCategoriesForm);
}

/**
 * Sets up the change event listener on the categories form to handle category selection.
 */
function setCheckedAttribute(categoriesForm) {
    let checkedCategoryId = localStorage.getItem("checkedCategoryId");
    if (!checkedCategoryId) {
        checkedCategoryId = "0";
        localStorage.setItem("checkedCategoryId", checkedCategoryId);
    }
    categoriesForm.addEventListener("change", async function (event) {
        const works = await loadGallery();
        checkedCategoryId = event.target.getAttribute("data-id");
        localStorage.setItem("checkedCategoryId", checkedCategoryId);
        filterAndDisplayWorks(works, checkedCategoryId);
    });
}

/**
 * Determines the checked attribute for a category input based on saved state.
 */
function getCheckedAttribute(categoryId) {
    const savedCategoryId = localStorage.getItem("checkedCategoryId");
    if (savedCategoryId === categoryId.toString()) {
        return "checked";
    } else {
        return "";
    }
}

/**
 * Load and display the categories.
 */
async function displayCategories(categories) {
    createCategories(categories);
}

/**
 * Filters the works based on the selected category
 * and create the gallery accordingly.
 */
async function filterAndDisplayWorks(works, categoryId) {
    if (categoryId === "0") {
        createGallery(works);
    } else {
        const filteredWorks = works.filter((work) => work.category.id.toString() === categoryId);
        createGallery(filteredWorks);
    }
}

/**
 * Loads the categories and gallery data and displays them.
 */
document.addEventListener("DOMContentLoaded", async function () {
    // Create the categories first to set the checked attribute and category ID
    const categories = await loadCategories();
    displayCategories(categories);
    // Then display the works based on the saved category ID
    const works = await loadGallery();
    const savedCategoryId = localStorage.getItem("checkedCategoryId");
    filterAndDisplayWorks(works, savedCategoryId);
});
