document.addEventListener("DOMContentLoaded", function () {
    updateCartCount(); // Cập nhật số lượng trên icon giỏ hàng

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn load trang

            let productCard = button.closest(".card");
            let productName = productCard.querySelector(".card-title").innerText;
            let productPrice = productCard.querySelector(".card-text").innerText;
            let productImg = productCard.querySelector(".card-img-top").src;

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            let existingProduct = cart.find((item) => item.name === productName);

            if (existingProduct) {
                existingProduct.quantity += 1; // Tăng số lượng
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    img: productImg,
                    quantity: 1,
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart)); // Lưu vào localStorage
            updateCartCount(); // Cập nhật số lượng trên icon giỏ hàng

            alert("Đã thêm vào giỏ hàng!");
        });
    });
});

// Cập nhật số lượng trên icon giỏ hàng
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").textContent = cart.length;
}



document.addEventListener("DOMContentLoaded", function () {
    displayCart(); // Hiển thị giỏ hàng

    // Xử lý sự kiện thanh toán
    document.getElementById("checkout").addEventListener("click", function () {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!"); // Không cho thanh toán nếu giỏ hàng trống
            return;
        }

        // Hiển thị thông báo và chuyển hướng về trang chủ
        alert("Thanh toán thành công!");
        localStorage.removeItem("cart"); // Xóa giỏ hàng
        window.location.href = "Trangchu.html"; // Chuyển về trang chủ
    });
});

// Hàm hiển thị giỏ hàng
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-items");
    let totalPriceElement = document.getElementById("total-price");
    let totalPrice = 0;

    cartContainer.innerHTML = ""; // Xóa nội dung cũ trước khi hiển thị lại

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Giỏ hàng trống</p>";
        totalPriceElement.textContent = "Tổng tiền: 0đ";
        return;
    }

    cart.forEach((item, index) => {
        let itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <img src="${item.img}" width="80">
            <p><strong>${item.name}</strong></p>
            <p>${item.price} x ${item.quantity}</p>
            <button class="remove-btn" data-index="${index}">Xóa</button>
        `;
        cartContainer.appendChild(itemElement);

        // Cộng tổng tiền
        totalPrice += parseFloat(item.price) * item.quantity;
    });

    // Hiển thị tổng tiền
    totalPriceElement.textContent = `Tổng tiền: ${totalPrice.toLocaleString()}đ`;

    document.getElementById("cart-items").addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-btn")) {
            let index = parseInt(event.target.getAttribute("data-index"));
            removeProduct(index);
        }
    });

    // Gán sự kiện "Xóa" cho từng nút
    document.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", function () {
            let index = parseInt(this.getAttribute("data-index")); // Lấy index của sản phẩm
            removeProduct(index);
        });
    });
}

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeProduct(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1); // Chỉ xóa sản phẩm có vị trí đúng
        localStorage.setItem("cart", JSON.stringify(cart)); // Lưu lại giỏ hàng
        displayCart(); // Cập nhật giao diện
    }
}

// Load giỏ hàng khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
    displayCart();
});
//mã đơn
function createOrderInfo(cart) {
    if (cart.length === 0) {
        return "Thanh toán đơn hàng trống";
    }

    // Lấy tên và số lượng của tối đa 3 sản phẩm đầu tiên
    const itemDescriptions = cart.slice(0, 3).map(item => {
        // Chỉ lấy tên sản phẩm mà không có khoảng trắng hoặc ký tự đặc biệt
        const cleanName = item.name.replace(/\s/g, '').substring(0, 15); // Giới hạn 15 ký tự
        return `${cleanName} (x${item.quantity})`;
    });

    let info = `Thanh toán: ${itemDescriptions.join(', ')}`;
    
    if (cart.length > 3) {
        info += ' và các sản phẩm khác...';
    }
    
    return info.substring(0, 150); // Giới hạn độ dài chuỗi (MoMo có giới hạn)
}



