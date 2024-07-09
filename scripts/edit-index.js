/***********************************************************************************
 *! Modal generation
 ***********************************************************************************/

/**
 * Generates the core HTML for a modal.
 */
function generateModalCore(className, title, content, buttonText, buttonType, backButton = "") {
    const modalCore = `
    <div class="modal-wrapper ${className}">
      <div class="modal-header">
        ${backButton}
        <button type="button" class="close-button"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-content">
        <h3>${title}</h3>
        <form class="modal-form submit-form">
          ${content}
          <hr>
          <button class="button-input" type="${buttonType}" ${buttonType === "submit" ? "disabled" : ""}>${buttonText}</button>
        </form>
      </div>
    </div>
  `;

    return modalCore;
}

/**
 * Creates the modal with a sub-modal.
 */
function generateFullModal(works, categories) {
    // Main modal
    const mClass = "main-modal";
    const mTitle = "Galerie photo";
    const mContent = `<div class="delete-works">${updateModalContent(works)}</div>`;
    const mButtonSubmitText = "Ajouter une photo";
    const mButtonType = "button";
    const mBackButton = "<div></div>";

    const mainModal = generateModalCore(mClass, mTitle, mContent, mButtonSubmitText, mButtonType, mBackButton);

    // Sub modal
    const sClass = "sub-modal";
    const sTitle = "Ajout photo";
    const sContent = `
      <div class="add-works">
        <div class="wrapper-image-selector">
          <i class="fa-regular fa-image"></i>
          <input type="file" id="image-selector-input" name="image-selector" accept=".jpg, .png">
          <label for="image-selector-input" role="button" aria-pressed="false">+ Ajouter photo</label>
          <span>jpg, png : 4mo max</span>   
          <img class="image-preview" src="" alt="Image to load">
        </div>
        <label for="title-input">Titre</label>
        <input type="text" id="title-input" name="title">
        <label for="category-select">Catégorie</label>
        <div class="wrapper-category-selector">
          <select id="category-select" name="category">
            <option disabled selected style="display: none;"></option>
            ${categories
                .slice(1)
                .map(
                    (category) => `
                    <option value="${category.id}">${category.name}</option>
                    `
                )
                .join("")}
          </select>
          <i class="fa-solid fa-angle-down" aria-hidden="true"></i>
        </div>
      </div>
    `;
    const sButtonSubmitText = "Valider";
    const sButtonType = "submit";
    const sBackButton = "<button class='back-button' type='button'><i class='fa-solid fa-arrow-left'></i></button>";

    const subModal = generateModalCore(sClass, sTitle, sContent, sButtonSubmitText, sButtonType, sBackButton);

    const modal = `
      <aside class="modal">
        ${mainModal}
        ${subModal}
      </aside>
    `;

    return modal;
}

/**
 * Updates the modal content with the provided works.
 */
function updateModalContent(works) {
    const modalContent = `
        ${works
            .map(
                (work) => `
                    <figure>
                        <img src="${work.imageUrl}" alt="${work.title}">
                        <button type="button" class="delete-icon" data-id="${work.id}">
                            <i class="fa-solid fa-trash-can"></i>                                  
                        </button>
                    </figure>
                `
            )
            .join("")}
    `;

    return modalContent;
}

/***********************************************************************************
 *! Modal updates and interaction handling
 ***********************************************************************************/

/**
 * Closes the modal.
 */
function closeModal() {
    const modal = document.querySelector(".modal");
    modal.parentNode.removeChild(modal);
    document.body.style.overflowY = "auto";
}

/**
 * Toggles the visibility of the main modal and sub-modal.
 */
function toggleModalVisibility() {
    const mainModal = document.querySelector(".main-modal");
    const subModal = document.querySelector(".sub-modal");
    const isSubModalVisible = subModal.style.display === "block";

    if (isSubModalVisible) {
        subModal.style.display = "none";
        mainModal.style.display = "block";
    } else {
        subModal.style.display = "block";
        mainModal.style.display = "none";
    }
}

/**
 * Retrieves all focusable elements within a given modal that are not disabled.
 */
function getFocusableElements(modal) {
    return Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter(
        (element) => !element.disabled
    );
}

/**
 * Traps the focus within the specified modal, ensuring that focus cycles through all focusable elements within the modal.
 * It dynamically updates the list of focusable elements to account for changes in element focusability, such as enabling a previously disabled input.
 */
function trapFocus(currentModal) {
    let focusableElements = getFocusableElements(currentModal);
    let firstFocusableElement = focusableElements[0];
    let lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (focusableElements.length === 0) return;

    currentModal.addEventListener("keydown", function (event) {
        if (event.key !== "Tab" && event.keyCode !== 9) {
            return;
        }

        // Update focusable elements on each tab press to handle dynamic changes
        // like the update of disabled elements
        focusableElements = getFocusableElements(currentModal);
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                event.preventDefault();
            }
        }
    });

    firstFocusableElement.focus();
}

/**
 * Attaches event listeners to modal elements for handling user interactions.
 */
function setupModalEvents() {
    const modal = document.querySelector(".modal");
    const innerModals = document.querySelectorAll(".modal-wrapper");
    const backButton = document.querySelector(".sub-modal .back-button");
    const openSubModal = document.querySelector(".main-modal .button-input");
    const closeModalButtons = document.querySelectorAll(".close-button");

    modal.addEventListener("click", closeModal);

    innerModals.forEach((modal) => {
        modal.addEventListener("click", (event) => event.stopPropagation());
    });

    closeModalButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    backButton.addEventListener("click", () => {
        toggleModalVisibility();
        trapFocus(document.querySelector(".main-modal"));
    });

    openSubModal.addEventListener("click", () => {
        toggleModalVisibility();
        trapFocus(document.querySelector(".sub-modal"));
    });
}

/***********************************************************************************
 *! Delete and create works - DELETE and POST
 ***********************************************************************************/

/**
 * Sends a DELETE request to the server to remove a work by its ID, using an authorization token.
 */
async function deleteWork(workId) {
    const modalForm = document.querySelector(".main-modal form");
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            // Retrieve the works from local storage and update the gallery HTML
            const works = JSON.parse(localStorage.getItem("works")) || [];
            const updatedWorks = works.filter((work) => work.id !== Number(workId));
            localStorage.setItem("works", JSON.stringify(updatedWorks));

            createGallery(updatedWorks);
            document.querySelector(".delete-works").innerHTML = updateModalContent(updatedWorks);
            clearFieldError(modalForm);

            console.log("Work deleted successfully");
        } else {
            throw new Error("Failed to delete work");
        }
    } catch (error) {
        console.error("Error deleting work:", error);
        showFieldError(modalForm, "Problème de connexion. Réessayez plus tard.");
    }
}

/**
 * Sends a POST request to the server to create a new work, using the form data and an authorization token.
 */
async function createWork(formData) {
    const modalForm = document.querySelector(".sub-modal form");
    const mainModal = document.querySelector(".main-modal");
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok) {
            const newWork = await response.json();
            const works = JSON.parse(localStorage.getItem("works")) || [];
            const updatedWorks = [...works, newWork];
            localStorage.setItem("works", JSON.stringify(updatedWorks));

            createGallery(updatedWorks);
            document.querySelector(".delete-works").innerHTML = updateModalContent(updatedWorks);

            toggleModalVisibility();
            trapFocus(mainModal);
            clearFieldError(modalForm);

            // Attach event listener to the newly created delete button in the modal
            const newWorkId = newWork.id; // Assuming newWork is the newly created work object
            const newDeleteButton = document.querySelector(`.delete-icon[data-id="${newWorkId}"]`);
            if (newDeleteButton) {
                newDeleteButton.addEventListener("click", () => deleteWork(newWorkId));
                console.log("delete button created", newWorkId);
            }

            console.log("Work created successfully");
        } else {
            throw new Error("Failed to create work");
        }
    } catch (error) {
        console.error("Error creating work:", error);
        showFieldError(modalForm, "Problème de connexion. Réessayez plus tard.");
    }
}

/***********************************************************************************
 *! Handle modal forms
 ***********************************************************************************/

/**
 * Sets up the click event listener for the delete buttons,
 * to delete the corresponding work from the gallery.
 */ 
function setupModalDeleteEvents() {
    const deleteButtons = document.querySelectorAll(".delete-icon");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => deleteWork(button.dataset.id));
    });
}

/**
 * Displays the image preview in the form and toggles the visibility of other elements.
 */
function setImagePreview(fileInput, preview) {
    const allElements = document.querySelectorAll(".wrapper-image-selector *");
    const otherElements = Array.from(allElements).filter((all) => all !== fileInput && all !== preview);
    const file = fileInput.files[0];

    if (file && isValidFileSize(file) && isValidFileType(file)) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            preview.style.display = "block";
            otherElements.forEach((element) => {
                element.style.display = "none";
            });
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
        otherElements.forEach((element) => {
            element.style.display = "block";
        });
    }
}

/**
 * Initializes the form within the modal by setting up event listeners and form submission handling.
 */
function setupModalFormEvents() {
    const workForm = document.querySelector(".sub-modal form");
    const fileInput = workForm.querySelector("#image-selector-input");
    const titleInput = workForm.querySelector("#title-input");
    const categorySelect = workForm.querySelector("#category-select");
    const fields = [fileInput, titleInput, categorySelect];
    const submitButton = workForm.querySelector(".button-input");
    const preview = document.querySelector(".image-preview");

    setupFormValidation(fields, submitButton);

    fileInput.addEventListener("change", () => {
        setImagePreview(fileInput, preview);
    });

    workForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const category = parseInt(categorySelect.value);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", category);

        await createWork(formData);
    });
}

/***********************************************************************************
 *! Edit mode
 ***********************************************************************************/

/**
 * Creates the top banner for edit mode.
 */
function createEditModeBanner() {
    const editModeBanner = `
        <div class="edit-banner">
            <i class="fa-regular fa-pen-to-square"></i>    
            <span>Mode édition</span>
        </div>
    `;
    const body = document.querySelector("body");
    body.insertAdjacentHTML("afterbegin", editModeBanner);
}

/**
 * Creates the edit button for works.
 */
function createEditWorksButton() {
    const editWorksButton = document.createElement("button");
    editWorksButton.classList.add("edit-button");
    editWorksButton.innerHTML = `
        <i class="fa-regular fa-pen-to-square"></i>
        <span>modifier</span>
    `;
    const galleryTitle = document.querySelector(".gallery-title");
    galleryTitle.appendChild(editWorksButton);
    setupEditWorksButtonEvents(editWorksButton);
}

/**
 * Sets up the click event listener for the edit works button,
 * to load the modal with the updated works.
 */
function setupEditWorksButtonEvents(editWorksButton) {
    editWorksButton.addEventListener("click", function () {
        // Load updated works and append modal to body
        const updatedWorks = JSON.parse(localStorage.getItem("works"));
        const categories = JSON.parse(localStorage.getItem("categories"));
        document.body.insertAdjacentHTML("beforeend", generateFullModal(updatedWorks, categories));

        // Set up trap focus and overflow hidden
        const mainModal = document.querySelector(".main-modal");
        trapFocus(mainModal);
        document.body.style.overflowY = "hidden";

        // Initialize modal / form events
        setupModalEvents();
        setupModalDeleteEvents();
        setupModalFormEvents();
    });
}
