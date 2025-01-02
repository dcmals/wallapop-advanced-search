const apiUrl = "https://api.wallapop.com/api/v3/users";
let cachedProducts = [];


const overlay = document.getElementById("loading-overlay");
const searchProductsInput = document.getElementById("search-products");
const sortProductsSelect = document.getElementById("sort-products");
const modal = document.getElementById("product-modal");

// Función para extraer el username de una URL completa
function extractSlug(input) {
    if (input.startsWith("https://")) {
        const parts = input.split("/");
        return parts[parts.length - 1];
    }
    return input;
}

// Disparar búsqueda al cargar si ?u está en la URL
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slugParam = urlParams.get("u");
    if (slugParam) {
        const slug = extractSlug(slugParam);
        document.getElementById("user-slug").value = slug;
        triggerSearch(slug);
    }
});

// Función para manejar la búsqueda
async function triggerSearch(slug) {
    if (!slug) {
        alert("Por favor, introduce un slug válido.");
        return;
    }

    // Actualizar la URL con el parámetro ?u
    const newUrl = `${window.location.origin}${window.location.pathname}?u=${slug}`;
    window.history.replaceState(null, "", newUrl);

    toggleLoading(true);

    try {
        const { userId, userInfo } = await fetchUserData(slug);
        cachedProducts = await fetchUserProducts(userId);
        displayUserInfo(userInfo);
        displayProducts(cachedProducts);
        toggleFilters(false);
    } catch (error) {
        alert("Error al recuperar datos del usuario: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

// Evento de clic en el botón de búsqueda
const searchButton = document.getElementById("search-user");
if (searchButton) {
    searchButton.addEventListener("click", () => {
        const slugInput = document.getElementById("user-slug").value.trim();
        const slug = extractSlug(slugInput);
        triggerSearch(slug);
    });
}

searchProductsInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredProducts = cachedProducts.filter(product =>
        product.title.toLowerCase().includes(query)
    );
    displayProducts(filteredProducts);
});

sortProductsSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    let sortedProducts = [...cachedProducts];

    if (value === "name-asc") {
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (value === "name-desc") {
        sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (value === "price-asc") {
        sortedProducts.sort((a, b) => a.price.amount - b.price.amount);
    } else if (value === "price-desc") {
        sortedProducts.sort((a, b) => b.price.amount - a.price.amount);
    }

    displayProducts(sortedProducts);
});

function toggleLoading(isLoading) {
    overlay.style.display = isLoading ? "flex" : "none";
    document.body.style.pointerEvents = isLoading ? "none" : "auto";
}

function toggleFilters(isDisabled) {
    searchProductsInput.disabled = isDisabled;
    sortProductsSelect.disabled = isDisabled;
}

async function fetchUserData(slug) {
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://es.wallapop.com/user/${slug}`);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, "text/html");
    const nextDataElement = htmlDoc.querySelector('#__NEXT_DATA__');
    if (!nextDataElement) throw new Error("No se pudo obtener los datos del usuario.");

    const nextData = JSON.parse(nextDataElement.textContent);
    const user = nextData.props.pageProps.user;
    const userStats = nextData.props.pageProps.userStats || {};

    return {
        userId: user.id,
        userInfo: {
            avatarImage: user.avatarImage || "",
            microName: user.microName || "",
            location: user.location?.city || "",
            registerDate: user.registerDate || "",
            userStats: userStats
        }
    };
}

async function fetchUserProducts(userId) {
    let products = [];
    let next = null;

    do {
        const response = await fetch(`${apiUrl}/${userId}/items${next ? `?since=${next}` : ""}`);
        const data = await response.clone().json();
        products = products.concat(data.data.map(item => ({
            title: item.title,
            description: item.description,
            images: item.images.map(img => img.urls.big),
            price: item.price,
            reserved: item.reserved?.flag || false,
            slug: item.slug,
            shippingEnabled: item.shipping?.item_is_shippable || false
        })));
        next = data.meta?.next;
    } while (next);

    return products;
}

function displayUserInfo(userInfo) {
    const userStats = userInfo.userStats?.counters || {};

    document.getElementById("user-avatar").src = userInfo.avatarImage || "https://placehold.co/200";
    document.getElementById("user-name").textContent = userInfo.microName || "Usuario desconocido";
    document.getElementById("user-location").textContent = `Ubicación: ${userInfo.location || "Desconocida"}`;
    document.getElementById("user-register-date").textContent = `Fecha de registro: ${formatDate(userInfo.registerDate)}`;
    document.getElementById("user-total-products").textContent = `Productos publicados: ${userStats.publish || 0}`;
    document.getElementById("user-buys").textContent = `Compras realizadas: ${userStats.buys || 0}`;
    document.getElementById("user-sells").textContent = `Ventas realizadas: ${userStats.sells || 0}`;
    document.getElementById("user-reviews").textContent = `Número de reviews: ${userStats.reviews || 0}`;
}

function displayProducts(products) {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product");
        productCard.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.price.amount} ${product.price.currency}</p>
            <p>Reservado: ${product.reserved ? "Sí" : "No"}</p>
            <p>Envío activado: ${product.shippingEnabled ? "Sí" : "No"}</p>
        `;
        productCard.addEventListener("click", () => showProductModal(product));
        productsContainer.appendChild(productCard);
    });
}

function formatDate(timestamp) {
    if (!timestamp) return "Desconocida";
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function showProductModal(product) {
    document.getElementById("modal-title").textContent = product.title;
    document.getElementById("modal-image").src = product.images[0];
    document.getElementById("modal-description").textContent = product.description;
    document.getElementById("modal-price").textContent = `Precio: ${product.price.amount} ${product.price.currency}`;
    document.getElementById("modal-reserved").textContent = `Reservado: ${product.reserved ? "Sí" : "No"}`;
    document.getElementById("modal-link").href = `https://es.wallapop.com/item/${product.slug}`;

    modal.style.display = "flex";

    document.getElementById("close-modal").addEventListener("click", () => {
        modal.style.display = "none";
    });
}
