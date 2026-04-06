
function sendDataToBeValidated(curr_vehicle, preferred_vehicle){
    $.ajax({
        type: "POST",
        url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/analyze-vehicle",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            current_vehicle: "a hyundai santa fe",
            preferred_vehicle: "no preference"
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