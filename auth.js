import { Amplify } from "https://esm.sh/aws-amplify";
import {
  signUp,
  confirmSignUp,
  signIn,
  getCurrentUser,
  resetPassword,
  confirmResetPassword
} from "https://esm.sh/aws-amplify/auth";
import { cognitoConfig } from "./cognito-config.js";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolClientId,
      loginWith: {
        email: true
      }
    }
  }
});

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const confirmForm = document.getElementById("confirmForm");

const authMessage = document.getElementById("authMessage");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b00020" : "#333";
}

function showLoginForm() {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  confirmForm.classList.add("hidden");

  showMessage("");
}

function showRegisterForm() {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  confirmForm.classList.add("hidden");

  showMessage("");
}

function showConfirmForm(email = "") {
  loginTab.classList.remove("active");
  registerTab.classList.remove("active");

  loginForm.classList.add("hidden");
  registerForm.classList.add("hidden");
  confirmForm.classList.remove("hidden");

  document.getElementById("confirmEmail").value = email;
  showMessage("");
}

function redirectAfterAuth() {
  const redirectTarget = sessionStorage.getItem("postAuthRedirect") || "index.html";
  window.location.href = redirectTarget;
}

window.togglePassword = function (inputId, iconElement) {
  const input = document.getElementById(inputId);
  const eye = iconElement.querySelector(".eye-icon");
  const eyeOff = iconElement.querySelector(".eye-off-icon");

  if (input.type === "password") {
    input.type = "text";
    eye.classList.add("hidden");
    eyeOff.classList.remove("hidden");
  } else {
    input.type = "password";
    eye.classList.remove("hidden");
    eyeOff.classList.add("hidden");
  }
};

loginTab.addEventListener("click", showLoginForm);
registerTab.addEventListener("click", showRegisterForm);


loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (email === "" || password === "") {
    showMessage("Please fill in all login fields.", true);
    return;
  }

  try {
    const alreadySignedIn = await getCurrentUser()
      .then(() => true)
      .catch(() => false);

    if (alreadySignedIn) {
      showMessage("You are already signed in. Redirecting...");
      setTimeout(() => {
        redirectAfterAuth();
      }, 700);
      return;
    }

    await signIn({
      username: email,
      password: password,
      options: {
        authFlowType: "USER_AUTH",
        preferredChallenge: "PASSWORD"
      }
    });

    showMessage("Login successful. Redirecting...");
    setTimeout(() => {
      redirectAfterAuth();
    }, 700);
  } catch (error) {
    console.error("Login error:", error);

    if (error.name === "UserAlreadyAuthenticatedException") {
      showMessage("You are already signed in. Redirecting...");
      setTimeout(() => {
        redirectAfterAuth();
      }, 700);
      return;
    }

    showMessage(error.message || "Login failed.", true);
  }
});

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (name === "" || email === "" || password === "" || confirmPassword === "") {
    showMessage("Please fill in all registration fields.", true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", true);
    return;
  }

  try {
    await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email
        }
      }
    });

    showMessage("Registration successful. Check your email for the verification code.");
    registerForm.reset();
    showConfirmForm(email);
  } catch (error) {
    console.error("Register error:", error);
    showMessage(error.message || "Registration failed.", true);
  }
});

confirmForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("confirmEmail").value.trim().toLowerCase();
  const code = document.getElementById("confirmCode").value.trim();

  if (email === "" || code === "") {
    showMessage("Please enter your email and verification code.", true);
    return;
  }

  try {
    await confirmSignUp({
      username: email,
      confirmationCode: code
    });

    showMessage("Account confirmed. You can now log in.");
    confirmForm.reset();
    showLoginForm();
    document.getElementById("loginEmail").value = email;
  } catch (error) {
    console.error("Confirmation error:", error);
    showMessage(error.message || "Confirmation failed.", true);
  }
});

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async function () {
    const emailInput = prompt("Enter your email to reset your password:");
    if (!emailInput) return;

    const email = emailInput.trim().toLowerCase();

    try {
      await resetPassword({ username: email });
      alert("A verification code was sent to your email.");

      const code = prompt("Enter the verification code:");
      if (!code) return;

      const newPassword = prompt(
        "Enter your new password.\nIt must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      if (!newPassword) return;

      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });

      alert("Password reset successful. You can now log in.");
      document.getElementById("loginEmail").value = email;
      showLoginForm();
    } catch (error) {
      console.error("Forgot password error:", error);
      alert(error.message || "Error resetting password.");
    }
  });
}

async function checkIfAlreadyLoggedIn() {
  const forceStayOnAuthPage = sessionStorage.getItem("forceStayOnAuthPage");

  if (forceStayOnAuthPage === "true") {
    sessionStorage.removeItem("forceStayOnAuthPage");

    if (sessionStorage.getItem("openRegisterTab") === "true") {
      sessionStorage.removeItem("openRegisterTab");
      showRegisterForm();
    } else {
      showLoginForm();
    }

    return;
  }

  try {
    await getCurrentUser();
    redirectAfterAuth();
  } catch (error) {
    if (sessionStorage.getItem("openRegisterTab") === "true") {
      sessionStorage.removeItem("openRegisterTab");
      showRegisterForm();
    } else {
      showLoginForm();
    }
  }
}

checkIfAlreadyLoggedIn();