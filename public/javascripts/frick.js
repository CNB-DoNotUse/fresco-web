jQuery.fn.frick = function(option1, option2){
    var o = $(this[0]);

    if (option1 === undefined)
        option1 = {};

    if (typeof option1 == 'object'){
        //Create the two slicks for viewing
        var content = o.children('img, video'),
            listCode = '';

        if (o.length > 0 && o.hasClass('slick-initialized'))
            o.slick("unslick");
        o.html('');
        o.addClass('frick');

        content.each(function(media_index, media){
            listCode += '<div class="frick-frame">'+media.outerHTML+'<div class="frick-overlay"><span class="mdi mdi-close-circle-outline icon"></span></div><a><span class="mdi mdi-close-circle icon"></span></a></div>';
        });

        o.append(listCode);
        
        o.slick({
            arrows: false,
            infinite: false,
            dots: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true
        });
        
        o.find('.frick-frame > a').on('click', function(){
            var _ = $(this).parent();
            
            var index = _.data('slick-index');

            if (index != null){
                _.toggleClass('frick-delete');
                _.parents('.frick').find('.slick-dots').children(':nth-child(' + (index + 1) + ')').toggleClass('frick-delete');
                $(this).children('.icon').toggleClass('addback');
            }
        });

        $(window).trigger('resize');
    }else if (option1 === 'frickPosts'){
        var posts = [];

        o.find('.slick-track').children(':not(.frick-delete)').each(function(frame_index, frame){
            posts.push($(frame).children('img, video').data('id'));
        });

        return posts;
    }
}

//"hello my name is elmir, I like pie and things and I lo"
//									-Elmer 8/27/2015