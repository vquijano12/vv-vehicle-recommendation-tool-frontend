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
       "What is your current vehicle's make and model? Please type only the make and model, for example: Toyota Camry. If you do not currently have a vehicle, type 'none'."
  },
  {
    key: "vehicleType",
    label: "Vehicle Type",
    question:
       "What type of vehicle are you looking for? Please type only one type, for example: SUV, sedan, truck, coupe, hatchback, or minivan. If you do not have a preference, type 'no preference'."
  },

  {
    key: "yearPreference",
    label: "Preferred Year",
    question:
       "What year do you prefer your vehicle? You can enter a specific year (for example: 2022) or a range (for example: 2018-2022). If you do not have a preference, type 'no preference'."
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
        "Do you have a preferred make and model? Please type only the make and model, for example: Honda Civic. If you do not have a preference, type 'no preference'."
  }
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

const userAnswers = {
  currentVehicle: "",
  vehicleType: "",
  yearPreference: "",
  preferredMakeAndModel: ""
};

function saveConversationState() {
  sessionStorage.setItem("vv_currentStep", currentStep);
  sessionStorage.setItem("vv_userAnswers", JSON.stringify(userAnswers));
  sessionStorage.setItem("vv_chatHtml", chatBox.innerHTML);
  sessionStorage.setItem("vv_isGeneratingRecommendations", JSON.stringify(isGeneratingRecommendations));
}

window.saveConversationState = function () {
  sessionStorage.setItem("vv_currentStep", currentStep);
  sessionStorage.setItem("vv_userAnswers", JSON.stringify(userAnswers));
  sessionStorage.setItem("vv_chatHtml", chatBox.innerHTML);
  sessionStorage.setItem("vv_isGeneratingRecommendations", JSON.stringify(isGeneratingRecommendations));
};

window.restoreConversationState = function () {
  const savedStep = sessionStorage.getItem("vv_currentStep");
  const savedAnswers = sessionStorage.getItem("vv_userAnswers");
  const savedChatHtml = sessionStorage.getItem("vv_chatHtml");
  const savedGeneratingState = sessionStorage.getItem("vv_isGeneratingRecommendations");

  if (savedAnswers) {
    const parsedAnswers = JSON.parse(savedAnswers);
    Object.assign(userAnswers, parsedAnswers);
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

  updateProgress();
};


const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const progressList = document.getElementById("progressList");

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

    userInput.placeholder = "You are signed in.";
    window.saveConversationState();
  }
};


// Handle user input
function handleUserInput() {

  if (isGeneratingRecommendations) return;
  
  const answer = userInput.value.trim();

  if (answer === "") return;

  const currentQuestion = questions[currentStep];
  addMessage("You", answer, "user-message", currentQuestion.key);

  userAnswers[currentQuestion.key] = formatAnswer(currentQuestion.key, answer);
  window.saveConversationState();

  saveConversationState();

  console.log("User Answers:", userAnswers);

  userInput.value = "";
  currentStep++;

  updateProgress();

  setTimeout(() => {
    if (currentStep < questions.length) {
      addMessage("Assistant", questions[currentStep].question, "bot-message");
      window.saveConversationState();
    } else {
      showRecommendationsInChat();
    }
  }, 500);
}

// Show recommendations

/*
async function showRecommendationsInChat() {
  addMessage(
    "Assistant",
    "Thank you! I have collected your preferences and I am now analyzing them.",
    "bot-message"
  );


  try {
    /*const validatedData = await getValidatedInputToDisplay();
    console.log("Validated input:", validatedData);
    await getVehicles();

    /* !!! TESTING -- remove later  */
    const answer = await getLLMResponse("Which vehicle is the safest?");

  } catch (error) {
    console.error("Validation failed:", error);

    addMessage(
      "Assistant",
      "I collected your preferences, but there was an issue validating them. Please try again.",
      "bot-message"
    );
  }


  userInput.disabled = true;
  sendButton.disabled = true;
  userInput.placeholder = "Conversation completed";
}

*/


async function showRecommendationsInChat() {
  if (isGeneratingRecommendations) return;
  isGeneratingRecommendations = true;

  addMessage(
    "Assistant",
    "Thank you! I have collected your preferences and I am now generating your recommendations.",
    "bot-message"
  );

  userInput.disabled = true;
  sendButton.disabled = true;
  userInput.placeholder = "Generating recommendations...";

  try {
    await getVehicles();
    userInput.placeholder = "Please log in to continue...";
  } catch (error) {
    console.error("Error generating recommendations:", error);

    addMessage(
      "Assistant",
      "There was an issue generating your vehicle recommendations. Please try again.",
      "bot-message"
    );

    userInput.placeholder = "Please log in to continue...";
  }
}


// Format answers
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
  sessionStorage.setItem("vv_isGeneratingRecommendations", JSON.stringify(isGeneratingRecommendations));
  sessionStorage.setItem("vv_inputDisabled", JSON.stringify(userInput.disabled));
  sessionStorage.setItem("vv_inputPlaceholder", userInput.placeholder);
};

window.restoreConversationState = function () {
  const savedStep = sessionStorage.getItem("vv_currentStep");
  const savedAnswers = sessionStorage.getItem("vv_userAnswers");
  const savedChatHtml = sessionStorage.getItem("vv_chatHtml");
  const savedGeneratingState = sessionStorage.getItem("vv_isGeneratingRecommendations");
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

  if (savedInputDisabled !== null) {
    userInput.disabled = JSON.parse(savedInputDisabled);
    sendButton.disabled = JSON.parse(savedInputDisabled);
  }

  if (savedPlaceholder) {
    userInput.placeholder = savedPlaceholder;
  }

  updateProgress();
};


// Title case helper
function formatTitleCase(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Add message to chat
window.addMessage = function (sender, text, className, answerKey = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${className}`;

  let editButton = "";

  if (className === "user-message" && answerKey) {
    editButton = `<button class="edit-answer-btn" data-key="${answerKey}">Edit</button>`;
  }

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
    listItems.forEach(item => item.classList.remove("active"));
    listItems[listItems.length - 1].classList.add("active");
  }
}


