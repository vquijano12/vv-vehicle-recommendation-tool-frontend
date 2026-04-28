const questions = [
  /*
  {
    key: "budget",
    label: "Budget",
    question: "What is your budget?"
  },
  */
  {
    key: "currentVehicle",
    label: "Current Vehicle",
    question:
      "What is your current vehicle's make and model? Please type only the make and model, for example: Toyota Camry. If you do not currently have a vehicle, type 'none'.",
  },
  {
    key: "vehicleType",
    label: "Vehicle Type",
    question:
      "What type of vehicle are you looking for? Please type only one type, for example: SUV, sedan, truck, coupe, hatchback, or minivan. If you do not have a preference, type 'no preference'.",
  },

  {
    key: "yearPreference",
    label: "Preferred Year",
    question:
      "What year do you prefer your vehicle? You can enter a specific year (for example: 2022) or a range (for example: 2018-2022). If you do not have a preference, type 'no preference'.",
  },

  /*
  {
    key: "fuelType",
    label: "Fuel Type",
    question: "What fuel type do you prefer? For example: gasoline, hybrid, electric, or diesel."
  },
  */
  {
    key: "preferredMakeAndModel",
    label: "Make/Model Preference",
    question:
      "Do you have a preferred make and model? Please type only the make and model, for example: Honda Civic. If you do not have a preference, type 'no preference'.",
  },
  /*
  ,
  {
    key: "safetyPriority",
    label: "Safety Priority",
    question: "How important is safety to you? You can answer high, medium, or low."
  },
  {
    key: "features",
    label: "Features",
    question: "What features are important to you? For example: AWD, backup camera, heated seats, or large cargo space."
  },
  {
    key: "lifestyleNeeds",
    label: "Lifestyle Needs",
    question: "How will you mainly use the vehicle? For example: commuting, family use, road trips, city driving, or long-distance travel."
  }
  */
];


let currentStep = 0;
let isGeneratingRecommendations = false;
let chatMode = false;
let awaitingLLM = false;

const userAnswers = {
  currentVehicle: "",
  vehicleType: "",
  yearPreference: "",
  preferredMakeAndModel: "",
};

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const progressList = document.getElementById("progressList");
const logoutButton = document.getElementById("logoutButton");

sendButton.addEventListener("click", handleUserInput);

userInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleUserInput();
  }
});

chatBox.addEventListener("click", function (event) {
  if (!event.target.classList.contains("edit-answer-btn")) return;

  const key = event.target.dataset.key;
  const oldValue = userAnswers[key] || "";

  const newValue = prompt("Edit your answer:", oldValue);

  if (newValue === null) return;
  if (newValue.trim() === "") return;

  userAnswers[key] = formatAnswer(key, newValue.trim());

  const messageDiv = event.target.closest(".message");
  const messageText = messageDiv.querySelector(".message-text");
  messageText.textContent = userAnswers[key];

  sessionStorage.removeItem("hasSeenFreeRecommendations");

  if (typeof window.saveConversationState === "function") {
    window.saveConversationState();
  }
});

window.onload = async function () {
  window.restoreConversationState();

  const hasSavedChat = sessionStorage.getItem("vv_chatHtml");

  if (!hasSavedChat) {
    addMessage(
      "Assistant",
      "Hello! I will guide you through a few questions to help identify a vehicle that matches your preferences.",
      "bot-message"
    );

    setTimeout(() => {
      addMessage("Assistant", questions[0].question, "bot-message");
      window.saveConversationState();
    }, 1000);
  } else {
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (typeof window.updateTopRightAuthButton === "function") {
    await window.updateTopRightAuthButton();
  }

  const isAuthenticated =
    typeof window.isUserAuthenticated === "function"
      ? await window.isUserAuthenticated()
      : false;

  if (isAuthenticated) {
    const authPrompt = document.getElementById("authPromptBox");
    if (authPrompt) authPrompt.remove();

    userInput.placeholder = chatMode
      ? "Ask a question about the recommendations..."
      : "Type your answer...";

    window.saveConversationState();
  }
};

async function handleUserInput() {
  if (isGeneratingRecommendations || awaitingLLM) return;

  const answer = userInput.value.trim();
  if (answer === "") return;

  if (!chatMode) {
    const currentQuestion = questions[currentStep];

    addMessage("You", answer, "user-message", currentQuestion.key);

    userAnswers[currentQuestion.key] = formatAnswer(currentQuestion.key, answer);

    console.log("User Answers:", userAnswers);

    userInput.value = "";
    currentStep++;
    updateProgress();
    window.saveConversationState();

    if (currentStep < questions.length) {
      setTimeout(() => {
        addMessage("Assistant", questions[currentStep].question, "bot-message");
        window.saveConversationState();
      }, 500);
    } else {
      chatMode = true;
      await showRecommendationsInChat();
    }

    return;
  }

  addMessage("You", answer, "user-message");
  userInput.value = "";

  awaitingLLM = true;
  sendButton.disabled = true;
  userInput.disabled = true;

  try {
    await getLLMResponse(answer);
  } catch (error) {
    console.error(error);
    addMessage(
      "Assistant",
      "There was an error getting a response.",
      "bot-message"
    );
  } finally {
    awaitingLLM = false;
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.placeholder = "Ask a question about the recommendations...";
    userInput.focus();
    window.saveConversationState();
  }
}

async function showRecommendationsInChat() {
  if (isGeneratingRecommendations) return;
  isGeneratingRecommendations = true;

  addMessage(
    "Assistant",
    "Thank you! I have collected your preferences and I am now generating your recommendations.",
    "bot-message"
  );

  try {
    await getVehicles();

    /*
    await getLLMResponse(
      "Start with this exact sentence: Based on the provided ranked dataset, here are the explanations for why these 3 vehicles are good recommendations: Then format each vehicle EXACTLY like this with no blank lines: • Vehicle Name - Score: value - Recall count: value - Severity weight: value - Complaint count: value Reason: one short sentence. End with a note starting with: Note that"
    );

    */

    await getLLMResponse(
      "Start with this exact sentence: Based on the provided ranked dataset, here are the explanations for why these 3 vehicles are good recommendations. Then use this format for each vehicle with no extra blank lines: • Vehicle Name - Score: value - Recall count: value - Severity weight: value - Complaint count: value Reason: one short sentence. End with a note starting with: Note that"
    );
    
    const isAuthenticated =
      typeof window.isUserAuthenticated === "function"
        ? await window.isUserAuthenticated()
        : false;

    if (!isAuthenticated && typeof window.showAuthPromptInChat === "function") {
      await window.showAuthPromptInChat();
    }


    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.placeholder = "Ask a question about the recommendations...";
    chatMode = true;
  } catch (error) {
    console.error("Error generating recommendations:", error);

    addMessage(
      "Assistant",
      "There was an issue generating your vehicle recommendations. Please try again.",
      "bot-message"
    );

    userInput.placeholder = "Please log in to continue...";
  } finally {
    isGeneratingRecommendations = false;
    window.saveConversationState();
  }
}

function formatAnswer(key, answer) {
  const cleanedAnswer = answer.trim();

  if (cleanedAnswer.toLowerCase() === "no preference") {
    return "No preference";
  }

  if (
    cleanedAnswer.toLowerCase() === "no current vehicle" ||
    cleanedAnswer.toLowerCase() === "none"
  ) {
    return "No current vehicle";
  }

  if (key === "vehicleType" && cleanedAnswer.toUpperCase() === "SUV") {
    return "SUV";
  }

  if (key === "yearPreference") {
    return cleanedAnswer;
  }

  return formatTitleCase(cleanedAnswer);
}

window.saveConversationState = function () {
  sessionStorage.setItem("vv_currentStep", currentStep);
  sessionStorage.setItem("vv_userAnswers", JSON.stringify(userAnswers));
  sessionStorage.setItem("vv_chatHtml", chatBox.innerHTML);
  sessionStorage.setItem(
    "vv_isGeneratingRecommendations",
    JSON.stringify(isGeneratingRecommendations)
  );
  sessionStorage.setItem("vv_chatMode", JSON.stringify(chatMode));
  sessionStorage.setItem("vv_inputDisabled", JSON.stringify(userInput.disabled));
  sessionStorage.setItem("vv_inputPlaceholder", userInput.placeholder);
};

window.restoreConversationState = function () {
  const savedStep = sessionStorage.getItem("vv_currentStep");
  const savedAnswers = sessionStorage.getItem("vv_userAnswers");
  const savedChatHtml = sessionStorage.getItem("vv_chatHtml");
  const savedGeneratingState = sessionStorage.getItem(
    "vv_isGeneratingRecommendations"
  );
  const savedChatMode = sessionStorage.getItem("vv_chatMode");
  const savedInputDisabled = sessionStorage.getItem("vv_inputDisabled");
  const savedPlaceholder = sessionStorage.getItem("vv_inputPlaceholder");

  if (savedAnswers) {
    Object.assign(userAnswers, JSON.parse(savedAnswers));
  }

  if (savedStep !== null) {
    currentStep = parseInt(savedStep, 10);
  }

  if (savedChatHtml) {
    chatBox.innerHTML = savedChatHtml;
  }

  if (savedGeneratingState) {
    isGeneratingRecommendations = JSON.parse(savedGeneratingState);
  }

  if (savedChatMode) {
    chatMode = JSON.parse(savedChatMode);
  }

  if (savedInputDisabled !== null) {
    userInput.disabled = JSON.parse(savedInputDisabled);
    sendButton.disabled = JSON.parse(savedInputDisabled);
  }

  if (savedPlaceholder) {
    userInput.placeholder = savedPlaceholder;
  }

  updateProgress();
};

function formatTitleCase(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

window.addMessage = function (sender, text, className, answerKey = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${className}`;

  
  let editButton = "";

  /*
  if (className === "user-message" && answerKey) {
    editButton = `<button class="edit-answer-btn" data-key="${answerKey}">Edit</button>`;
  } 
  */

  messageDiv.innerHTML = `
    <div class="message-label">${sender}</div>
    <div class="message-text">${text}</div>
    ${editButton}
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (typeof window.saveConversationState === "function") {
    window.saveConversationState();
  }
};

function updateProgress() {
  const listItems = progressList.querySelectorAll("li");

  listItems.forEach((item, index) => {
    item.classList.remove("active");

    if (index === currentStep && currentStep < listItems.length) {
      item.classList.add("active");
    }
  });

  if (currentStep >= questions.length) {
    listItems.forEach((item) => item.classList.remove("active"));
    listItems[listItems.length - 1].classList.add("active");
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    window.location.href = "auth.html";
  });
}