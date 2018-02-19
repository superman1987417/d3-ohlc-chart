 var fetchData = function(targetUrl) {
    var ohlcData;
    var lineData = [];
    var retData = {};
    $.ajax({
        type: "GET",
        url: targetUrl,
        data: $('#user_form').serialize(),
        success: function( data, textStatus, jqXHR ) {                                  
            // if(jqXHR.status == 201) {       
            // }
            // console.log("response data");                
            // jQuery.parseJSON(data);                  
            for (var prop in data) {                    
                
                if(data[prop].type == "ohlc") {                        
                    data[prop].data.forEach(function(element) {
                        element.date = new Date(element.date);
                        // console.log(element);
                    });
                    ohlcData = data[prop].data;
                }

                if(data[prop].type == "drawLine") {                        
                    data[prop].data.forEach(function(element) {
                        element.date = new Date(element.date);
                        // console.log(element);
                    });
                    lineData.push(data[prop]);
                }
            }

            // updateChart(isFromZero);               

            // updateChart();
            $("#update-btn").css("visibility", "visible");

            return {'ohlcData': ohlcData, 'lineData': lineData};



        },
        error: function (xhr, ajaxOptions, thrownError) {
            // if(xhr.status == 400) {                        
            // }                    
        }

        return false;

    }); 
}