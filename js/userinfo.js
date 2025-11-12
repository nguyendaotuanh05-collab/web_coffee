document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "dangnhap.html";
        return;
    }

    const userData = JSON.parse(localStorage.getItem(loggedInUser));

    if (!userData) {
        alert("Không tìm thấy thông tin người dùng!");
        return;
    }

    document.getElementById("display-username").textContent = userData.username || "Chưa cập nhật";
    document.getElementById("display-email").textContent = userData.email || "Chưa cập nhật";
    document.getElementById("display-phone").textContent = userData.phone || "Chưa cập nhật";
});