let rankedVehicles = [];

// Send vehicle preference data to backend
async function sendDataForVehicles(make, year) {
  return $.ajax({
    type: "POST",
    url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      make: make,
      year: year
    }),
    error: function (jqXHR, status, error) {
      console.log("Error", jqXHR, status, error);
    }
  });
}

// Display top 3 recommendations in the chat
function displayRecommendationsInChat(recommendedVehicles) {
  let message = "<strong>Here are 3 vehicles that match your preferences:</strong><br><br>";

  const vehicles =
    recommendedVehicles?.rankedVehicles ||
    recommendedVehicles?.results ||
    [];

  if (vehicles.length === 0) {
    message += "No vehicle recommendations were found.";
  } else {
    vehicles.slice(0, 3).forEach((vehicle, index) => {
      const make =
        vehicle.Make_Name ||
        vehicle.make ||
        vehicle.makeName ||
        vehicle.Make ||
        "Unknown Make";

      const model =
        vehicle.Model_Name ||
        vehicle.model ||
        vehicle.modelName ||
        vehicle.Model ||
        "Unknown Model";

      message += `${index + 1}. ${make} ${model}<br>`;
    });
  }

  window.addMessage("Assistant", message, "bot-message");
}

window.renderRecommendationsInChat = displayRecommendationsInChat;

// Handle final recommendation display and login prompt
async function handleFinalRecommendations(recommendedVehicles) {
  displayRecommendationsInChat(recommendedVehicles);

  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");

  if (userInput) {
    userInput.value = "";
    userInput.placeholder = "Please log in to continue...";
    userInput.disabled = true;
  }

  if (sendButton) {
    sendButton.disabled = true;
  }

  if (typeof window.showAuthPromptInChat === "function") {
    await window.showAuthPromptInChat();
  }

  if (typeof window.saveConversationState === "function") {
    window.saveConversationState();
  }
}

// Get vehicles from validated user input
async function getVehicles() {
  const validatedInput = await getValidatedInputToDisplay();

  let make;
  const year = validatedInput["preferredYear"];

  if (validatedInput["preferredMake"]) {
    make = validatedInput["preferredMake"];
  } else {
    make = validatedInput["currMake"];
  }

  const response = await sendDataForVehicles(make, year);

  rankedVehicles = response?.rankedVehicles || response?.results || [];

  console.log("Recommended Vehicles:", rankedVehicles);

  await handleFinalRecommendations(response);

  return rankedVehicles;
}

// Send question to LLM/system
async function converse(question, vehicleList) {
  return $.ajax({
    type: "POST",
    url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      question: question,
      rankedVehicles: vehicleList
    }),
    error: function (jqXHR, status, error) {
      console.log("Error", jqXHR, status, error);
    }
  });
}

// Get LLM response and display it in chat
async function getLLMResponse(question) {
  const response = await converse(question, rankedVehicles);
  const llmAnswer = response?.answer ?? "Sorry, I could not get a response.";

  console.log("Question:", question);
  console.log("LLM Response:", llmAnswer);

  if (typeof window.addMessage === "function") {
    window.addMessage("Assistant", llmAnswer, "bot-message");
  }

  return llmAnswer;
}