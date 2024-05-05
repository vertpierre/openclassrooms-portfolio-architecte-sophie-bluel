/**
 * Configures the form submission logic including validation and API request.
 */
function setupFormSubmission(loginForm, emailInput, passwordInput) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!isFieldNotEmpty(email)) {
            showFieldError(emailInput, "ne peut pas être vide");
        }

        if (!isFieldNotEmpty(password)) {
            showFieldError(passwordInput, "ne peut pas être vide");
        }

        if (isFieldNotEmpty(email) && isValidEmail(email) && isFieldNotEmpty(password)) {
            await submitLoginCredentials(email, password);
        }
    });
}

/**
 * Submits the login credentials to the server and handles the response.
 */
async function submitLoginCredentials(email, password) {
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem("token", data.token);
            window.location.href = "./index.html";
        } else {
            const modalTitle = `${response.status}`;
            const modalContent = `
                <div>
                    <p>Utilisateur ou mot de passe incorrect</p>
                </div> 
            `;
            const modalButtonSubmitText = "Réessayer";
            const modalHasSub = false;
            const modal = createModal(modalTitle, modalContent, modalButtonSubmitText, modalHasSub);
            displayModal(modal);
            throw new Error("Failed to log in " + response.status);
        }
    } catch (error) {
        console.error("Error: " + error.message);
    }
}

/**
 * Sets up real-time validation on the provided input element.
 * This function now clears field errors only when the user starts typing in a previously empty field.
 */
function setupFieldValidation(inputElement) {
    let validationTimeout = null;

    inputElement.addEventListener("input", function () {
        clearTimeout(validationTimeout);

        // Check if the field was previously empty and had an error
        if (!isFieldNotEmpty(inputElement.value)) {
            showFieldError(inputElement, "ne peut pas être vide");
        } else {
            clearFieldError(inputElement);
        }

        validationTimeout = setTimeout(() => {
            if (inputElement.type === "email") {
                if (!isValidEmail(inputElement.value)) {
                    showFieldError(inputElement, "écriture invalide");
                }
            }
        }, 600);
    });
}

/**
 * Displays an error message within the label of the specified input field.
 */
function showFieldError(inputElement, errorMessage) {
    const labelElement = document.querySelector(`label[for="${inputElement.id}"]`);
    clearFieldError(inputElement);
    const errorSpan = document.createElement("span");
    errorSpan.textContent = ` — ${errorMessage}`;
    errorSpan.style.color = "red";
    labelElement.appendChild(errorSpan);
}

/**
 * Clears any existing error message within the label of the specified input field.
 */
function clearFieldError(inputElement) {
    const labelElement = document.querySelector(`label[for="${inputElement.id}"]`);
    const errorSpan = labelElement.querySelector("span");
    if (errorSpan) {
        labelElement.removeChild(errorSpan);
    }
}

/**
 * Validates if the provided email is in a correct format.
 */
function isValidEmail(email) {
    if (email === "") {
        return true;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * Checks if the specified field is not empty.
 */
function isFieldNotEmpty(fieldValue) {
    return fieldValue.trim() !== "";
}

/**
 * Initializes the login form by setting up event listeners and form submission handling.
 */
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".submit-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    loginForm.setAttribute("novalidate", "");
    setupFieldValidation(emailInput);
    setupFieldValidation(passwordInput);
    setupFormSubmission(loginForm, emailInput, passwordInput);
});
