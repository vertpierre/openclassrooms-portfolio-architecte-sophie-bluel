/***********************************************************************************
 *! Load index data - GET
 ***********************************************************************************/

/**
 * Fetches gallery data from the server and initializes the gallery view.
 * If data exists on the server, it is saved to local storage.
 * If data doesn't exist on the server, it is retrieved from local storage.
 * If data doesn't exist in either location, an error is thrown.
 */
async function loadWorksData() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const worksData = await response.json();
        localStorage.setItem("works", JSON.stringify(worksData));
        return worksData;
    } catch (error) {
        const worksData = localStorage.getItem("works");
        if (worksData) {
            return JSON.parse(worksData);
        } else {
            console.error("Erreur lors de la récupération des données de la galerie :", error);
            throw error;
        }
    }
}

/**
 * Fetches categories data from the server and initializes the categories section.
 * Same as above.
 */
async function loadCategoriesData() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        let categoriesData = await response.json();
        categoriesData.unshift({ id: 0, name: "Tous" });
        localStorage.setItem("categories", JSON.stringify(categoriesData));
        return categoriesData;
    } catch (error) {
        const categoriesData = localStorage.getItem("categories");
        if (categoriesData) {
            return JSON.parse(categoriesData);
        } else {
            console.error("Erreur lors de la récupération des données des catégories :", error);
            throw error;
        }
    }
}

/***********************************************************************************
 *! Display index from data
 ***********************************************************************************/

/**
 * Conditionally loads categories, gallery, and edit data
 * based on session authentication and displays them.
 */
document.addEventListener("DOMContentLoaded", async function () {
    const token = sessionStorage.getItem("token");
    const categories = await loadCategoriesData();
    const works = await loadWorksData();
    const savedCategoryId = localStorage.getItem("selectedCategoryId");

    if (token) {
        // If a token exists, load all works, and edit UI elements
        createGallery(works);
        createEditModeBanner();
        createEditWorksButton();
    } else {
        // Load and display categories and works if token is not found
        createCategories(categories);
        createFilteredGallery(works, savedCategoryId);
    }
});
