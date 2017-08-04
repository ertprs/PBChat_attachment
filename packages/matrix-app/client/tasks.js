
Template.tasks.helpers({
    Customers: function () {
        var customer = Template.instance().customers.get();
        console.log(customer.CustName);
        return customer.CustName;

    },
    timeStamp: function () {
        var customer = Template.instance().customers.get();
        return moment(customer.ts).format('LTS');

    },
    pageName: function () {
        var customer = Template.instance().customers.get();
        return customer.Page;
    },
    timeConversion: function () {
        var customer = Template.instance().customers.get();
        return moment(customer.ts).format('LTS');
    }
});

Template.tasks.onCreated(function () {
    this.customers = new ReactiveVar();
    this.customers.set(Template.currentData());
});

Template.tasks.rendered = function () {
    // $('#carousel').slick({
    //     dots: true,
    //     arrows: true
    // });

    // $('.responsive').slick({
    //     prevArrow: $('.prev'),
    //     nextArrow: $('.next'),
    //     infinite: false,
    //     speed: 300,
    //     slidesToShow: 7,
    //     slidesToScroll: 1,
    //     autoplay:true,
    //     dots: false,
    // });
    // if ($(".slide").length < 1) {
    //     $('.new_cust').fadeIn(3000/*,function(){$('.slide-container').slideUp({ duration:1500, easing: "easeInOutQuart"           });}*/).css("display", "block");
    //     $('.prev').hide();
    //     $('.next').hide();}

    // setInterval(function () {
    //     console.log('setInterval');
    //     $('.responsive').slick({
    //         prevArrow: $('.prev'),
    //         nextArrow: $('.next'),
    //         infinite: false,
    //         speed: 300,
    //         slidesToShow: 7,
    //         slidesToScroll: 1,
    //         dots: false,
    //     });
    //     if ($(".slide").length < 1) {
    //         $('.new_cust').fadeIn(3000/*,function(){$('.slide-container').slideUp({ duration:1500, easing: "easeInOutQuart"           });}*/).css("display", "block");
    //         $('.prev').hide();
    //         $('.next').hide();
    //     }
    // }, 500);
        // setInterval(function()
        //     { 
        //         console.log('hello interval'); 
        //         if ($(".slides li").length < 7)
        //         {
        //             console.log('less then 7'); 
        //             $('.flexslider').flexslider({
        //             animation: "slide",
        //             itemWidth: 210,
        //             itemMargin: 10,
        //             minItems: 0,
        //             maxItems: 50,
        //             move: 1,
        //             animationLoop: true,
        //             pauseOnAction: true,
        //             pauseOnHover: true,
        //             useCSS: false,
        //             slideshow: false,
        //             controlNav: false,
        //             directionNav: true,
        //             prevText: " ",
        //             nextText: " "
        //             });
        //         }
        //         else
        //         {
        //             console.log('greater then 7');
        //             $('.flexslider').flexslider({
        //             animation: "slide",
        //             itemWidth: 210,
        //             itemMargin: 10,
        //             minItems: 0,
        //             maxItems: 50,
        //             move: 1,
        //             animationLoop: true,
        //             pauseOnAction: true,
        //             pauseOnHover: true,
        //             useCSS: false,
        //             slideshow: false,
        //             controlNav: false,
        //             directionNav: true,
        //             prevText: " ",
        //             nextText: ""
        //             });
        //         }            
        //     }, 1000);        

        //setInterval(setTimeout,100);
        // setInterval(
        // $('.flexslider').flexslider({
        //     animation: "slide",
        //     itemWidth: 200,
        //     itemMargin: 0,
        //     minItems: 0,
        //     maxItems: 50,
        //     move: 4,
        //     animationLoop: true,
        //     pauseOnAction: true,
        //     pauseOnHover: true,
        //     useCSS: false,
        //     slideshow: false,
        //     controlNav: false,
        //     prevText: ' ',
        //     nextText: ' '
        // }),100);

};
