(function() {
    window.onload = function() {
        var embedBlocks = document.getElementsByTagName('blockquote'),
            embedBlock = null,
            WEB_ROOT = 'http://localhost:3000';

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
            height = embedParent.offsetWidth,
            source = WEB_ROOT + '/embed/' + gallery; //define embed iframe source
        
        //If we have no gallery, stop the embed
        if(!gallery) return;

        //Customize iframe based on data attributes
        if(typeof(embedBlock.dataset.width) !== 'undefined'){
            width = embedBlock.dataset.width;
            height = width;
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
            overflow:hidden;\
            -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
               -mox-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
                    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
            -webkit-border-radius:4px;\
               -moz-border-radius:4px;\
                -ms-border-radius:4px;\
                    border-radius:4px;\
            display: block;\
            background: rgb(255, 255, 255);\
        ';

        // browser compatibility: get method for event 
        // addEventListener(FF, Webkit, Opera, IE9+) and attachEvent(IE5-8)
        var myEventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        // create event listener
        var myEventListener = window[myEventMethod];
        // browser compatibility: attach event uses onmessage
        var myEventMessage = myEventMethod == "attachEvent" ? "onmessage" : "message";
        // register callback function on incoming message
        myEventListener(myEventMessage, function (e) {
            // we will get a string (better browser support) and validate
            // if it is an int - set the height of the iframe #my-iframe-id
            if (e.data === parseInt(e.data)){
                //Set the height based on the content
                window.dynamicHeight = true;
                iframe.style.height = e.data + "px";
            }
        }, false);

        //TODO Make height of parent

        //Insert iframe after blockquote
        embedParent.insertBefore(iframe, embedBlock.nextSibling);
        //Remove blockquote
        embedParent.removeChild(embedBlock);
    }

    window.onresize = function() {
        var iframe = document.getElementById('fresco-iframe');

        if(!iframe || window.dynamicHeight) return;

        var embedParent = iframe.parentNode;

        iframe.style.height = embedParent.offsetWidth;
    }
})();