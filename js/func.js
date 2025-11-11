// thanh slide bar
function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.left === "-250px") {
        sidebar.style.left = "0";
    } else {
        sidebar.style.left = "-250px";
    }
}

// liên hệ
document.querySelector  ('form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Cảm ơn bạn đã gửi thắc mắc! Chúng tôi sẽ phản hồi sớm nhất.');
});


// popup
function Popup() {
    document.getElementById("ads-container").style.display = "block";
}
function ClosePopup() {
    document.getElementById("ads-container").style.display = "none";
}

// trang chi tiết
function addToViewed(product) {
    let viewedList = document.getElementById("viewed-list");
    let item = document.createElement("div");
    item.innerHTML = `<img src="${product.image}" alt="${product.name}"><p>${product.name} - ${product.price}đ</p>`;
    viewedList.appendChild(item);
}

//popup trang chi tiết
// Mở popup khi nhấn vào ảnh
function openPopup(src) {
    const popup = document.getElementById("popup");
    const popupImg = document.getElementById("popup-img");
    popup.style.display = "flex";
    popupImg.src = src;
}

// Đóng popup
function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
}

// Đóng popup khi nhấn bên ngoài hình ảnh
document.addEventListener("click", function (event) {
    const popup = document.getElementById("popup");
    const popupImg = document.getElementById("popup-img");

    if (event.target === popup && event.target !== popupImg) {
        closePopup();
    }
});













