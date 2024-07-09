/***********************************************************************************
 *! Login - POST
 ***********************************************************************************/

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
            sessionStorage.setItem("userId", data.userId);
            window.location.href = "./index.html";
        } else {
            throw new Error("Failed to log in: " + response.status);
        }
    } catch (error) {
        console.error("Connection error: ", error);
        throw error;
    }
}

/***********************************************************************************
 *! Handle login
 ***********************************************************************************/

/**
 * Initialize the login form by setting up the event listeners and processing the form submission.
 */
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".submit-form");
    const fields = [document.getElementById("email"), document.getElementById("password")];
    const submitButton = loginForm.querySelector("button[type='submit']");

    setupFormValidation(fields, submitButton);

    loginForm.setAttribute("novalidate", "");
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            await submitLoginCredentials(fields[0].value, fields[1].value);
            console.log("Login successful");
        } catch (error) {
            console.error("Login failed:", error);
            if (error.message.includes("Failed to log in")) {
                showFieldError(loginForm, "E-mail ou mot de passe incorrect");
            } else {
                showFieldError(loginForm, "Problème de connexion. Réessayez plus tard.");
            }
        }
    });
});
