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
      error: function (jqxHR, status, error) {
        console.log("Error", jqxHR, status, error);
      }
    });
  }
  
  function displayRecommendationsInChat(recommendedVehicles) {
    let message = "<strong>Here are 3 vehicles that match your preferences:</strong><br><br>";
  
    recommendedVehicles.results.slice(0, 3).forEach((vehicle, index) => {
      message += `${index + 1}. ${vehicle.Make_Name} ${vehicle.Model_Name}<br>`;
    });
  
    window.addMessage("Assistant", message, "bot-message");
  }
  
  window.renderRecommendationsInChat = displayRecommendationsInChat;
  
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
    console.log("Recommended Vehicles: ", response);
  
    await handleFinalRecommendations(response);
  
    return response;
  }