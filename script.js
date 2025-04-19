const cartItems = document.getElementById('cartItems'); 

const cartList = document.getElementById('cartList'); 

const cartTotal = document.getElementById('cartTotal'); 

const addToCartButtons = document.querySelectorAll('.add-to-cart'); 

let iconCart = document.querySelector('.cart'); 

let closeCart = document.querySelector('.close'); 

let body = document.querySelector('body'); 

 

let cartCount = 0; 

let totalAmount = 0; 

 

addToCartButtons.forEach(button => { 

  button.addEventListener('click', () => { 

    const price = parseFloat(button.getAttribute('data-price')); 

    cartCount++; 

    cartItems.innerText = cartCount; 

 

    totalAmount += price; 

    cartTotal.innerText = `$${totalAmount.toFixed(2)}`; 

 

    const listItem = document.createElement('li'); 

    listItem.innerText = `Book Title ($${price.toFixed(2)})`; 

    cartList.appendChild(listItem); 

  }); 

}); 

 

iconCart.addEventListener('click',() => { 

    body.classList.toggle('showCart'); 

}) 

 

closeCart.addEventListener('click',() => { 

    body.classList.toggle('showCart'); 

}) 