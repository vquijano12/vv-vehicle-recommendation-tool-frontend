async function sendDataForVehicles(make, year){
    return $.ajax({
        type: "POST",
        url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            model: model,
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



