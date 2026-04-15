//function to send data to the LLM to be analyzed and validated
function sendDataToBeValidated(curr_vehicle, preferred_vehicle, preferred_year, preferred_type){ //return cleaned input
    return $.ajax({
        type: "POST",
        url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/analyze-vehicle",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            current_vehicle: curr_vehicle,
            preferred_vehicle: preferred_vehicle,
            preferred_year: preferred_year,
            preferred_type: preferred_type
        }),
        success: function(response){
            console.log(this.data)
            console.log("Success:", response)
        },
        error: function(jqXHR, status, error){
            console.log ("Error", jqXHR, status, error)
        }
    });
}

async function getValidatedInputToDisplay() {
    const response = await sendDataToBeValidated(userAnswers["currentVehicle"], userAnswers["preferredMakeAndModel"], userAnswers["yearPreference"], userAnswers["vehicleType"]);
    const data = response.data
    if(response.stage === "validated"){
        return {
            "currMake" : data?.current_vehicle?.make?.name  ?? null,
            "currModel": data?.current_vehicle?.model?.name ?? null,
            "preferredMake": data?.preferred_vehicle?.make?.name ?? null,
            "preferredModel": data?.preferred_vehicle?.model?.name ?? null,
        }
    }
    return null;
}

