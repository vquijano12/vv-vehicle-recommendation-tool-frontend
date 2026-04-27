import { Amplify } from "https://esm.sh/aws-amplify";
import { getCurrentUser, signOut } from "https://esm.sh/aws-amplify/auth";
import { cognitoConfig } from "./cognito-config.js";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolClientId,
      loginWith: { email: true }
    }
  }
});

window.isUserAuthenticated = async function () {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};

window.forceLogout = async function () {
  try {
    await signOut({ global: true });
  } catch (error) {
    console.error("Logout error:", error);
  }

  localStorage.clear();

  sessionStorage.removeItem("openRegisterTab");
  sessionStorage.removeItem("forceStayOnAuthPage");
  sessionStorage.removeItem("hasSeenFreeRecommendations");

  window.location.href = "index.html";
};

window.showAuthPromptInChat = async function () {
  const isAuthenticated = await window.isUserAuthenticated();
  if (isAuthenticated) return;

  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const existingPrompt = document.getElementById("authPromptBox");
  if (existingPrompt) return;

  const promptDiv = document.createElement("div");
  promptDiv.className = "message bot-message";
  promptDiv.id = "authPromptBox";

  promptDiv.innerHTML = `
    <div class="message-label">Assistant</div>
    <div class="message-text">
      Please log in or create an account if you would like to continue using the tool.
      <div class="auth-action-buttons">
        <button id="chatLoginButton" class="auth-action-btn">Log In</button>
        <button id="chatRegisterButton" class="auth-action-btn secondary">Create Account</button>
      </div>
    </div>
  `;

  chatBox.appendChild(promptDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("chatLoginButton").onclick = function () {
    if (typeof window.saveConversationState === "function") {
      window.saveConversationState();
    }

    sessionStorage.setItem("postAuthRedirect", "index.html");
    sessionStorage.removeItem("openRegisterTab");
    sessionStorage.setItem("forceStayOnAuthPage", "true");
    window.location.href = "auth.html";
  };

  document.getElementById("chatRegisterButton").onclick = function () {
    if (typeof window.saveConversationState === "function") {
      window.saveConversationState();
    }

    sessionStorage.setItem("postAuthRedirect", "index.html");
    sessionStorage.setItem("openRegisterTab", "true");
    sessionStorage.setItem("forceStayOnAuthPage", "true");
    window.location.href = "auth.html";
  };
};

window.updateTopRightAuthButton = async function () {
  const authButton = document.getElementById("logoutButton");
  if (!authButton) return;

  const isAuthenticated = await window.isUserAuthenticated();

  if (isAuthenticated) {
    authButton.textContent = "Logout";
    authButton.onclick = window.forceLogout;
  } else {
    authButton.textContent = "Login";
    authButton.onclick = function () {
      if (typeof window.saveConversationState === "function") {
        window.saveConversationState();
      }

      sessionStorage.setItem("postAuthRedirect", "index.html");
      sessionStorage.removeItem("openRegisterTab");
      sessionStorage.setItem("forceStayOnAuthPage", "true");
      window.location.href = "auth.html";
    };
  }
};

window.updateTopRightAuthButton();