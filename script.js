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

const userAnswers = {
  currentVehicle: "",
  vehicleType: "",
  yearPreference: "",
  preferredMakeAndModel: ""
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


window.onload = function () {
  addMessage(
    "Assistant",
    "Hello! I will guide you through a few questions to help identify a vehicle that matches your preferences.",
    "bot-message"
  );

  setTimeout(() => {
    addMessage("Assistant", questions[0].question, "bot-message");
  }, 1000);
};


// Handle user input
function handleUserInput() {
  const answer = userInput.value.trim();

  if (answer === "") return;

  addMessage("You", answer, "user-message");

  const currentQuestion = questions[currentStep];
  userAnswers[currentQuestion.key] = formatAnswer(currentQuestion.key, answer);

  console.log("User Answers:", userAnswers);

  userInput.value = "";
  currentStep++;

  updateProgress();

  setTimeout(() => {
    if (currentStep < questions.length) {
      addMessage("Assistant", questions[currentStep].question, "bot-message");
    } else {
      showRecommendationsInChat();
    }
  }, 500);
}

// Show recommendations
async function showRecommendationsInChat() {
  addMessage(
    "Assistant",
    "Thank you! I have collected your preferences and I am now analyzing them.",
    "bot-message"
  );


  try {
    /*const validatedData = await getValidatedInputToDisplay();
    console.log("Validated input:", validatedData);*/
    await getVehicles();


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

// Title case helper
function formatTitleCase(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Add message to chat
function addMessage(sender, text, className) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${className}`;

  messageDiv.innerHTML = `
    <div class="message-label">${sender}</div>
    <div class="message-text">${text}</div>
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}


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

// Logout button
if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    window.location.href = "auth.html";
  });
}