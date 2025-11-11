document.addEventListener("DOMContentLoaded", function () {
    const accountDropdown = document.querySelector(".account-dropdown");
    const dropdownMenu = document.querySelector(".login .dropdown-menu");

    // Mở dropdown khi di chuột vào icon tài khoản
    accountDropdown.addEventListener("mouseenter", () => {
        dropdownMenu.style.display = "block";
        setTimeout(() => {
            dropdownMenu.style.opacity = "1";
        }, 10);
    });

    // Ẩn dropdown khi rời chuột khỏi khu vực dropdown
    accountDropdown.addEventListener("mouseleave", () => {
        dropdownMenu.style.opacity = "0";
        setTimeout(() => {
            dropdownMenu.style.display = "none";
        }, 200);
    });

    // Hoạt động khi click vào icon tài khoản (cho mobile)
    accountDropdown.addEventListener("click", (event) => {
        event.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
        dropdownMenu.classList.toggle("show");
    });

    // Ẩn dropdown khi click ra ngoài
    document.addEventListener("click", (event) => {
        if (!accountDropdown.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });
});

