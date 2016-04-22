(function() {
    window.onload = function() {
        var embedBlocks = document.getElementsByTagName('blockquote'),
            embedBlock = null,
            WEB_ROOT = 'http://dev.fresconews.com';

        //Find the block we're looking for by the class name
        for (var i = 0; i < embedBlocks.length; i++) {
            if(embedBlocks[i].className.indexOf('fresco-media') > -1){
                embedBlock = embedBlocks[i];
                break;
            }
        }

        if(embedBlock == null) return; //No blockquote found :(

        var embedParent =  embedBlock.parentNode, //define parent
            gallery = embedBlock.dataset.gallery, //define galleryId
            width = '100%',
            height = '100%',
            source = WEB_ROOT + '/embed/' + gallery; //define embed iframe source
        
        //If we have no gallery, stop the embed
        if(!gallery) return;

        //Customize iframe based on data attributes
        if(typeof(embedBlock.dataset.width) !== 'undefined'){
            width = embedBlock.dataset.width;
        }
        if(typeof(embedBlock.dataset.start) !== 'undefined'){
            source += '?start=' + embedBlock.dataset.start;
        }
        if(typeof(embedBlock.dataset.cycle) !== 'undefined'){
            source += '&cycle=' + embedBlock.dataset.cycle;
        }

        //Generate iframe
        var iframe = document.createElement('iframe');
        iframe.id = 'fresco-iframe';
        iframe.src = source;
        iframe.style.cssText = '\
            border: 0;\
            margin: 0;\
            padding:0;\
            height:' + height + ';\
            width:' + width + ';\
            -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
               -mox-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
                    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
            -webkit-border-radius:2px;\
               -moz-border-radius:2px;\
                -ms-border-radius:2px;\
                    border-radius:2px;\
            display: block;\
            background: rgb(255, 255, 255);\
        ';

        //Set height to inner contents on load
        iframe.onload = function() {
            //If the width is set, then set the height based on the content
            if(width !== '100%'){
                iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
            }
        };

        //Insert iframe after blockquote
        embedParent.insertBefore(iframe, embedBlock.nextSibling);
        //Remove blockquote
        embedParent.removeChild(embedBlock);
    };
})();