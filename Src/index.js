let products = [];
let cart = [];

//* selectors

const selectors = {
    products: document.querySelector(".products"),
    cartBtn: document.querySelector(".cart-btn"),
    cartQty: document.querySelector(".cart-qty"),
    
  };
  
  //* event listeners
  
  const setupListeners = () => {
    document.addEventListener("DOMContentLoaded", initStore);
  };
  
  //*event handler
  
    const initStore = () => {
      fetch('https://fakestoreapi.com/products/category/jewelery')
      .then(renderProducts);
              
              
    }
  
  // render functions
  
  const renderProducts = () => {
      selectors.products.innerHTML = products
        .map((product) => {
         const { id, title, image, price } = product;
          return `
        <div class="product">
          <img src="${image}" alt="${title}" />
          <h3>${title}</h3>
          <h5>${price.format()}</h5>
          <button ${disabled} data-id=${id}>${text}</button>
        </div>
        `;
        })
      };
  
  // api function
  
      const loadProducts = async (apiURL) => {
      try {
        const response = await fetch(apiURL);
        if (!response.ok) {
          throw new Error(`http error! status=${response.status}`);
        }
        products = await response.json();
        console.log (products);
      } catch (error) {
        console.error("fetch error:", error);
      }
    };//
    // product event
  
    selectors.products.addEventListener("click", addToCart);
  
    // cart events
    selectors.cartBtn.addEventListener("click", showCart);
    selectors.cartClose.addEventListener("click", hideCart);
    selectors.cartBody.addEventListener("click", updateCart);
    selectors.cartClear.addEventListener("click", clearCart);
  
  // Rest of your code remains the same
  