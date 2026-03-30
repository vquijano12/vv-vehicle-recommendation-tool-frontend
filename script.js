const questions = [
/*    {
      key: "budget",
      label: "Budget",
      question: "What is your budget?"
    },*/
    {
      key: "vehicleType",
      label: "Vehicle Type",
      question: "What type of vehicle are you looking for? For example: SUV, sedan, truck, coupe, hatchback, or minivan."
    },
    {
      key: "fuelType",
      label: "Fuel Type",
      question: "What fuel type do you prefer? For example: gasoline, hybrid, electric, or diesel."
    },
    {
      key: "brand",
      label: "Brand Preference",
      question: "Do you have a preferred brand? You can type the brand name or say no preference."
    },
/*    {
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
    }*/
  ];
  
  let currentStep = 0;
  const userAnswers = {};
  
  const chatBox = document.getElementById("chatBox");
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const progressList = document.getElementById("progressList");
  const summaryPanel = document.getElementById("summaryPanel");
  const resultsPanel = document.getElementById("resultsPanel");
  const summaryContent = document.getElementById("summaryContent");
  const resultsContent = document.getElementById("resultsContent");
  
  sendButton.addEventListener("click", handleUserInput);
  
  userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleUserInput();
    }
  });
  
  function handleUserInput() {
    const answer = userInput.value.trim();
  
    if (answer === "") {
      return;
    }
  
    addMessage("You", answer, "user-message");
  
    const currentQuestion = questions[currentStep];
    userAnswers[currentQuestion.key] = answer;
  
    userInput.value = "";
  
    currentStep++;
  
    updateProgress();
  
    setTimeout(() => {
      if (currentStep < questions.length) {
        addMessage("Assistant", questions[currentStep].question, "bot-message");
      } else {
        addMessage(
          "Assistant",
          "Thank you! I have collected your preferences. Here is a summary of your answers.",
          "bot-message"
        );
  
        showSummary();
        showRecommendationPlaceholder();
  
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = "Conversation completed";
      }
    }, 500);
  }
  
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
      listItems.forEach((item) => item.classList.remove("active"));
      listItems[listItems.length - 1].classList.add("active");
    }
  }
  
  function showSummary() {
    summaryPanel.classList.remove("hidden");
    summaryContent.innerHTML = "";
  
    questions.forEach((question) => {
      const div = document.createElement("div");
      div.className = "summary-item";
      div.innerHTML = `<strong>${question.label}:</strong> ${userAnswers[question.key]}`;
      summaryContent.appendChild(div);
    });
  }
  
  function showRecommendationPlaceholder() {
    resultsPanel.classList.remove("hidden");
    resultsContent.innerHTML = `
      <div class="result-card">
        <h4>Recommendations</h4>
        <p>I am analyzing your preferences to find the best matches for you.</p>
      </div>
    `;
  }