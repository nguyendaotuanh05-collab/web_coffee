document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItemCount = document.querySelector('.item .cart-icon span');
    const cartItemsList = document.querySelectorAll('.cart-items');
    const cartTotal = document.querySelectorAll('.cart-total');
    const cartIcon = document.querySelectorAll('.item .cart-icon');
    const sildebar = document.getElementById('.slidevar');

    let cartItems = [];
    let totalAmount = 0;

    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const item = {
                name: document.querySelectorAll('.card .card-title')[index].textContent,
                price: parseFloat(
                    document.querySelectorAll('.price')[index].textContent.slice(1),
                ),
                quantity: 1,
            };

            const exisitingItem = cartItems.find(
                (cardItem) => cardItem.name === item.name,
            );
            if (exisitingItem) {
                exisitingItem.quantity++;
            }
            else {
                cartItems.push(item);
            }

            totalAmount += item.price;

            updateCartUI();
        });

        function updateCartUI(){
            updateCartItemCount(cartItems.length);
            updateCartItemList();
            updateCartTotal();
        }

        function updateCartItemCount(count) {
            cartItemCount.textContent = count;
        }

        function updateCartItemList() {
            cartItemsList.innerHTML = '';
            cartItems.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item', 'indivdual-cart-item');
                cartItem.innerHTML=`
                <span>(${item.quantity}x)${item.name}</span>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}
                <button class="remove-btn" data-index="${index}"><i class="fa-solid fa-times"</i></button>
                </span>
                `;

                cartItemsList.append(cartItem);
            });
 
            const removeButtons = document.querySelectorAll('.remove-item');
            removeButtons.forEach((button) => {
                button.addEventListener('click',(event) => {
                    const index = event.target.dataset.index;
                    removeItemFromCart(index);
                });
            });
        }

        function removeItemFromCart(index) {
            const removeItem = cartItems.splice(index, 1)[0];
            totalAmount -= removeItem.price * removeItem.quantity;
            updateCartUI;
        }

        function updateCartTotal(){
            cartTotal.textContent = `$${totalAmount.toFixed(2)}`;
        }

        cartIcon.addEventListener('click',() => {
            sildebar.classList.toggle('open');
        });

        const closeButton = document.querySelector('.slidebar-close');
        closeButton.addEventListener('click', () => {
            sildebar.classList.remove('open');
        });
    });

});