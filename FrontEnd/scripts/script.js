function loadGallery() {
    fetch("http://localhost:5678/api/works")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response error.");
            }
            return response.json();
        })
        .then((data) => {
            const gallery = document.querySelector(".gallery");
            gallery.innerHTML = "";
            data.forEach((work) => {
                const galleryContent = `
                    <figure>
                        <img src="${work.imageUrl}" alt="${work.title}">
                        <figcaption>${work.title}</figcaption>
                    </figure>
                `;
                gallery.insertAdjacentHTML("beforeend", galleryContent);
            });
        })
        .catch((error) => {
            console.error("Error fetching gallery data:", error);
        });
}

// Call loadGallery on page load
document.addEventListener("DOMContentLoaded", loadGallery);
