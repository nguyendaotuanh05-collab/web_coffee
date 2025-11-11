// Xử lý đăng ký
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (!username || !email || !phone || !password || !confirmPassword) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        if (localStorage.getItem(username)) {
            alert("Tên đăng nhập đã tồn tại!");
            return;
        }

        const userData = { username, email, phone, password };
        localStorage.setItem(username, JSON.stringify(userData));


        alert("Đăng ký thành công! Hãy đăng nhập.");
        window.location.href = "dangnhap.html";
    });
}

// Xử lý đăng nhập
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("login-password").value;
        const user = JSON.parse(localStorage.getItem(username));

        if (!user || user.password !== password) {
            alert("Tên đăng nhập hoặc mật khẩu không đúng!");
            return;
        }

        localStorage.setItem("loggedInUser", username);
        alert("Đăng nhập thành công!");
        window.location.href = "Trangchu.html";
    });
}

// Xử lý hiển thị trên trang chủ
const loggedInUser = localStorage.getItem("loggedInUser");
const userInfo = document.getElementById("user-info");
const signupLink = document.getElementById("signup-link");
const loginLink = document.getElementById("login-link");
const userPageLink = document.getElementById("user-page-link");
const logoutLink = document.getElementById("logout-link");

if (loggedInUser) {
    const userData = JSON.parse(localStorage.getItem(loggedInUser));
    userInfo.textContent = `Xin chào, ${loggedInUser}`;
    signupLink.style.display = "none";
    loginLink.style.display = "none";
    userPageLink.style.display = "block";
    logoutLink.style.display = "block";

    // Hiển thị thông tin cá nhân
    const displayUsername = document.getElementById("display-username");
    const displayEmail = document.getElementById("display-email");
    const displayPhone = document.getElementById("display-phone");

    if (displayUsername) displayUsername.textContent = userData.username;
    if (displayEmail) displayEmail.textContent = userData.email;
    if (displayPhone) displayPhone.textContent = userData.phone;
} else {
    userInfo.textContent = "";
    signupLink.style.display = "block";
    loginLink.style.display = "block";
    userPageLink.style.display = "none";
    logoutLink.style.display = "none";


}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem("loggedInUser");
    alert("Bạn đã đăng xuất thành công!");

    // Cập nhật lại giao diện ngay lập tức
    userInfo.textContent = "";
    signupLink.style.display = "block";
    loginLink.style.display = "block";
    userPageLink.style.display = "none";
    logoutLink.style.display = "none";

    // Sau đó reload trang
    window.location.href = "Trangchu.html";
}

