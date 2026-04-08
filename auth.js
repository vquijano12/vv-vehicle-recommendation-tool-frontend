const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

loginTab.addEventListener("click", function () {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  authMessage.textContent = "";
});

registerTab.addEventListener("click", function () {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  authMessage.textContent = "";
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (email === "" || password === "") {
    authMessage.textContent = "Please fill in all login fields.";
    return;
  }

  authMessage.textContent = "Login successful. Redirecting...";

  setTimeout(function () {
    window.location.href = "index.html";
  }, 1000);
});

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (name === "" || email === "" || password === "" || confirmPassword === "") {
    authMessage.textContent = "Please fill in all registration fields.";
    return;
  }

  if (password !== confirmPassword) {
    authMessage.textContent = "Passwords do not match.";
    return;
  }

  authMessage.textContent = "Registration successful. Redirecting to login...";

  setTimeout(function () {
    loginTab.click();
    registerForm.reset();
  }, 1000);
});