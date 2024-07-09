/***********************************************************************************
 *! Functions for field validation
 ***********************************************************************************/

/**
 * Displays an error message within the label of the specified input field.
 */
function showFieldError(inputElement, errorMessage) {
    clearFieldError(inputElement);
    const labelElement = document.querySelector(`label[for="${inputElement.id}"]`) || inputElement;
    const errorSpan = document.createElement("span");
    if (errorMessage !== "") {
        errorSpan.textContent = `${errorMessage}`;
    }
    errorSpan.classList.add("error-message");
    labelElement.appendChild(errorSpan);
}

/**
 * Clears any existing error message within the label of the specified input field.
 */
function clearFieldError(inputElement) {
    const labelElement = document.querySelector(`label[for="${inputElement.id}"]`) || inputElement;
    const errorSpan = labelElement.querySelector(".error-message");
    if (errorSpan) {
        labelElement.removeChild(errorSpan);
    }
}

/**
 * Checks if the specified field is not empty.
 */
function isFieldEmpty(fieldValue) {
    return fieldValue.trim() === "";
}

/**
 * Validates if the provided email is in a correct format.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates if the provided file size is within the allowed limit.
 */
function isValidFileSize(file) {
    return file && file.size <= 4 * 1024 * 1024;
}

/**
 * Validates if the provided file type is allowed (JPEG or PNG).
 */
function isValidFileType(file) {
    return file && ["image/jpeg", "image/png"].includes(file.type);
}

/***********************************************************************************
 *! Base field validation
 ***********************************************************************************/

/**
 * Sets up form submission logic, including field validation and image preview.
 * Initializes event listeners on form fields to validate their content
 * and manages the form submission button's enabled state based on validation results.
 */
function setupFormValidation(fields, submitButton) {
    const fieldValidity = {};
    let debounceStringValidity;

    /**
     * Updates the enabled state of the submit button based on the validity of all fields.
     */
    function updateFormValidity() {
        console.log("Form validity:", fieldValidity);
        const allFieldsValid = Object.values(fieldValidity).every((isValid) => isValid);
        submitButton.disabled = !allFieldsValid;
    }

    /**
     * Validates a single field and updates its error state.
     */
    function validateField(field) {
        let isValid = !isFieldEmpty(field.value);

        if (field.type === "file") {
            const file = field.files[0];
            isValid = isValid && isValidFileSize(file) && isValidFileType(file);
        }

        if (field.type === "email") {
            isValid = isValid && isValidEmail(field.value);
        }

        if (!isValid) {
            showFieldError(field, getErrorMessage(field));
        } else {
            clearFieldError(field);
        }

        return isValid;
    }

    /**
     * Determines the appropriate error message for a field based on its type and value.
     */
    function getErrorMessage(field) {
        if (isFieldEmpty(field.value)) {
            return "";
        } else if (field.type === "file") {
            if (!isValidFileSize(field.files[0])) {
                return "La taille doit être inférieur à 4 Mo";
            } else if (!isValidFileType(field.files[0])) {
                return "Le format doit être JPEG ou PNG";
            }
        } else if (field.type === "email" && !isValidEmail(field.value)) {
            return "Écriture invalide";
        }
        return "";
    }

    /**
     * Attaches input and change event listeners to fields for validation.
     */
    fields.forEach((field) => {
        const fieldName = `${field.id}`;
        fieldValidity[fieldName] = false;

        field.addEventListener("input", () => {
            if (field.type === "email") {
                clearTimeout(debounceStringValidity);
                debounceStringValidity = setTimeout(() => {
                    fieldValidity[fieldName] = validateField(field);
                    updateFormValidity();
                }, 600);
            } else {
                fieldValidity[fieldName] = validateField(field);
                updateFormValidity();
            }
        });

        field.addEventListener("change", () => {
            fieldValidity[fieldName] = validateField(field);
            updateFormValidity();
        });
    });

    updateFormValidity();
}
