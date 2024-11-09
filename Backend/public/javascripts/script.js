function AddToCart(proid) {
    $.ajax({
        url: '/add-to-cart/'+proid,
        method: 'GET',
        success: function (response) {
           // console.log("ajax =>>>>", JSON.stringify(response)); 
            if (response.status) {
                let count = $("#cart-count").html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
            } 

        }
        
    })
}