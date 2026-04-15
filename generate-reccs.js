async function sendDataForVehicles(make, year){
    return $.ajax({
        type: "POST",
        url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            make: make,
            year: year
        }),
        success: function(response){
            console.log(this.data)
            console.log("Success:", response)
        },
        error: function(jqxHR, status, error){
            console.log("Error", jqxHR, status, error)
        }
    });
}

async function getVehicles(){
    const validatedInput = await getValidatedInputToDisplay()
    let make;
    const year = validatedInput["preferredYear"];

    if (validatedInput["preferredMake"]){ //if preferred vehicle not null
        make = validatedInput["preferredMake"];
    }
    else{ // if preferred vehicle null
        make = validatedInput["currMake"];
    }

    //get vehicles
    const response = await sendDataForVehicles(make, year);
    console.log(response);
}

