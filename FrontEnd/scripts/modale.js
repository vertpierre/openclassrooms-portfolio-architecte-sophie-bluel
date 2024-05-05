/**
 * Creates a generic modal that can be reused with different content.
 * This function also ensures that when the modal is displayed, the focus is trapped inside the modal for accessibility.
 */
function createModal(modalTitle, modalContent, modalButtonSubmitText, modalHasSub, subModalTitle, subModalContent, subModalButtonSubmitText) {
    const modalId = modalTitle.toLowerCase().replace(/ /g, "-");
    const modalButtonSubmit = modalTitle === "404" ? `onclick="event.preventDefault(); closeModal('${modalId}')"` : "";

    /**
     * Generates the HTML markup for a modal wrapper.
     */
    function generateModalWrapper(wrapperClass, wrapperId, wrapperTitle, wrapperContent, wrapperButtonSubmitText, wrapperButtonSubmit = "", backButtonAction = "") {
        return `
            <div class="modal-wrapper ${wrapperClass}" onclick="event.stopPropagation()">
                <div class="modal-header">
                    ${backButtonAction ? `
                        <button class="back-button" aria-label="Back" onclick="${backButtonAction}">
                            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.439478 8.94458C-0.146493 9.53055 -0.146493 10.4822 0.439478 11.0681L7.9399 18.5686C8.52587 19.1545 9.47748 19.1545 10.0635 18.5686C10.6494 17.9826 10.6494 17.031 10.0635 16.445L5.11786 11.5041H19.4999C20.3297 11.5041 21 10.8338 21 10.004C21 9.17428 20.3297 8.50393 19.4999 8.50393H5.12255L10.0588 3.56303C10.6447 2.97706 10.6447 2.02545 10.0588 1.43948C9.47279 0.853507 8.52118 0.853507 7.93521 1.43948L0.43479 8.9399L0.439478 8.94458Z" fill="black" />
                            </svg>
                        </button>
                    ` : '<div></div>'}
                    <button class="close-button" aria-label="Close" onclick="closeModal('${wrapperId}')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6546 8.05106C18.1235 7.58214 18.1235 6.82061 17.6546 6.35169C17.1856 5.88277 16.4241 5.88277 15.9552 6.35169L12.005 10.3056L8.05106 6.35544C7.58214 5.88652 6.82061 5.88652 6.35169 6.35544C5.88277 6.82436 5.88277 7.58589 6.35169 8.05481L10.3056 12.005L6.35544 15.9589C5.88652 16.4279 5.88652 17.1894 6.35544 17.6583C6.82436 18.1272 7.58589 18.1272 8.05481 17.6583L12.005 13.7044L15.9589 17.6546C16.4279 18.1235 17.1894 18.1235 17.6583 17.6546C18.1272 17.1856 18.1272 16.4241 17.6583 15.9552L13.7044 12.005L17.6546 8.05106Z" fill="black" />
                        </svg>
                    </button>
                </div>
                <div class="modal-content">
                    <h3 id="modal-title-${wrapperId}">${wrapperTitle}</h3>
                    <form class="modal-form" action="">
                        ${wrapperContent}
                        <hr>
                        <button class="button-input" type="submit" aria-label="${wrapperButtonSubmitText}" ${wrapperButtonSubmit}>
                            ${wrapperButtonSubmitText}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    const modalMainContent = generateModalWrapper("main-modal", modalId, modalTitle, modalContent, modalButtonSubmitText, modalButtonSubmit);

    let modalSubContent = "";

    if (modalHasSub) {
        const subModalId = subModalTitle.toLowerCase().replace(/ /g, "-");
        const backButtonAction = `closeModal('${subModalId}'); displayModal(document.getElementById('${subModalId}').outerHTML)`;
        modalSubContent = generateModalWrapper("sub-modal", subModalId, subModalTitle, subModalContent, subModalButtonSubmitText, "", backButtonAction);
    }

    return `
        <aside class="modal" id="${modalTitle}" role="dialog" aria-modal="true" aria-labelledby="modal-title-${modalTitle}" onclick="handleModalClick(event, '${modalTitle}')">
            ${modalMainContent}
            ${modalSubContent}
        </aside>
    `;
}

/**
 * Add the modal to the body and display it.
 * Also trap the focus inside the modal.
 */
function displayModal(modalHtml) {
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = document.querySelector(".modal:last-of-type");
    const focusableElements = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener("keydown", function (e) {
        let isTabPressed = e.key === "Tab" || e.keyCode === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    });

    firstFocusableElement.focus();
}

/**
 * Close the modal by removing it from the DOM.
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.parentNode.removeChild(modal);
    }
}

/**
 * Manage click events on the modal to close it if the click is outside the modal container.
 */
function handleModalClick(event, id) {
    if (event.target.classList.contains("modal")) {
        closeModal(id);
    }
}
