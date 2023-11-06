// Initialize empty arrays for products and cart
let products = [];
let cart = [];

// Initialize empty arrays for products and cart
const selectors = {
  products: document.querySelector(".products"),
  cartBtn: document.querySelector(".cart-btn"),
  cartQty: document.querySelector(".cart-qty"),
  cartClose: document.querySelector(".cart-close"),
  cart: document.querySelector(".cart"),
  cartOverlay: document.querySelector(".cart-overlay"),
  cartClear: document.querySelector(".cart-clear"),
  cartBody: document.querySelector(".cart-body"),
  cartTotal: document.querySelector(".cart-total"),
};

// Set up event listeners for various actions
const setupListeners = () => {
  document.addEventListener("DOMContentLoaded", initStore);

  // Load the initial store data when DOM content is loaded
  selectors.products.addEventListener("click", addToCart);

  // Add event listener for clicking on products to add to the cart
  selectors.cartBtn.addEventListener("click", showCart);
  selectors.cartOverlay.addEventListener("click", hideCart);
  selectors.cartClose.addEventListener("click", hideCart);
  selectors.cartBody.addEventListener("click", updateCart);
  selectors.cartClear.addEventListener("click", clearCart);
};

// Add event listeners for cart interactions
const initStore = () => {
    // Load the cart items from local storage
  loadCart();
  // Load products from the specified API and render them
  loadProducts("https://fakestoreapi.com/products")
    .then(renderProducts)
    .finally(renderCart);
};

// Show the cart by adding appropriate classes
const showCart = () => {
  selectors.cart.classList.add("show");
  selectors.cartOverlay.classList.add("show");
};

// Hide the cart by removing appropriate classes
const hideCart = () => {
  selectors.cart.classList.remove("show");
  selectors.cartOverlay.classList.remove("show");
};

// Clear the cart by resetting the cart array and rendering
const clearCart = () => {
  cart = [];
  saveCart();
  renderCart();
  renderProducts();
  setTimeout(hideCart, 500);
};

// Add the selected product to the cart if it's not already in it
const addToCart = (e) => {
  if (e.target.hasAttribute("data-id")) {
    const id = parseInt(e.target.dataset.id);
    const inCart = cart.find((x) => x.id === id);

    if (inCart) {
      alert("Item is already in cart.");
      return;
    }

    cart.push({ id, qty: 1 });
    saveCart();
    renderProducts();
    renderCart();
    showCart();
  }
};

// Remove an item from the cart by filtering out the selected id
const removeFromCart = (id) => {
  cart = cart.filter((x) => x.id !== id);

  // if the last item is removed, close the cart
  cart.length === 0 && setTimeout(hideCart, 500);

  renderProducts();
};

// Increase the quantity of a specific item in the cart
const increaseQty = (id) => {
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty++;
};

// Decrease the quantity of a specific item in the cart and remove it if it reaches 0
const decreaseQty = (id) => {
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty--;

  if (item.qty === 0) removeFromCart(id);
};

// Handle cart updates based on button clicks for quantity changes
const updateCart = (e) => {
  if (e.target.hasAttribute("data-btn")) {
    const cartItem = e.target.closest(".cart-item");
    const id = parseInt(cartItem.dataset.id);
    const btn = e.target.dataset.btn;

    btn === "incr" && increaseQty(id);
    btn === "decr" && decreaseQty(id);

    saveCart();
    renderCart();
  }
};

// Save the cart items to local storage
const saveCart = () => {
  localStorage.setItem("online-store", JSON.stringify(cart));
};

// Load the cart items from local storage
const loadCart = () => {
  cart = JSON.parse(localStorage.getItem("online-store")) || [];
};

//* render functions
// Render the cart based on the current cart items
const renderCart = () => {
  // show cart qty in navbar
  const cartQty = cart.reduce((sum, item) => {
    return sum + item.qty;
  }, 0);

  selectors.cartQty.textContent = cartQty;
  selectors.cartQty.classList.toggle("visible", cartQty);

  // show cart total
  selectors.cartTotal.textContent = calculateTotal().format();

  // show empty cart
  if (cart.length === 0) {
    selectors.cartBody.innerHTML =
      '<div class="cart-empty">Your cart is empty.</div>';
    return;
  }

  // show cart items
  selectors.cartBody.innerHTML = cart
    .map(({ id, qty }) => {
      // get product info of each cart item
      const product = products.find((x) => x.id === id);

      const { title, image, price } = product;

      const amount = price * qty;

      return `
        <div class="cart-item" data-id="${id}">
          <img src="${image}" alt="${title}" />
          <div class="cart-item-detail">
            <h3>${title}</h3>
            <h5>${price.format()}</h5>
            <div class="cart-item-amount">
              <i class="bi bi-dash-lg" data-btn="decr"></i>
              <span class="qty">${qty}</span>
              <i class="bi bi-plus-lg" data-btn="incr"></i>

              <span class="cart-item-price">
                ${amount.format()}
              </span>
            </div>
          </div>
        </div>`;
    })
    .join("");
};

// Render the products based on the current product data
const renderProducts = () => {
  selectors.products.innerHTML = products
    .map((product) => {
      const { id, title, image, price } = product;

      // check if product is already in cart
      const inCart = cart.find((x) => x.id === id);

      // make the add to cart button disabled if already in cart
      const disabled = inCart ? "disabled" : "";

      // change the text if already in cart
      const text = inCart ? "Added in Cart" : "Add to Cart";

      return `
    <div class="product">
      <img src="${image}" alt="${title}" />
      <h3>${title}</h3>
      <h5>${price.format()}</h5>
      <button ${disabled} data-id=${id}>${text}</button>
    </div>
    `;
    })
    .join("");
};

//* api functions
// Load products from the specified API URL and filter for jewelry items
const loadProducts = async (apiURL) => {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`http error! status=${response.status}`);
    }
    products = await response.json();
    // Filter out products that are not jewelry
    products = products.filter((product) => product.category === "jewelery");
    console.log(products);
  } catch (error) {
    console.error("fetch error:", error);
  }
};

//* helper functions
// Calculate the total cost of items in the cart
const calculateTotal = () => {
  return cart
    .map(({ id, qty }) => {
      const { price } = products.find((x) => x.id === id);
      return qty * price;
    })
    .reduce((sum, number) => {
      return sum + number;
    }, 0);
};

// Format numbers as currency using prototype function
Number.prototype.format = function () {
  return this.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

//* initialize
// Initialize the setup of event listeners
setupListeners();