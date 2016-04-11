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

        var embedParent =  embedBlock.parentNode, //define parent
            gallery = embedBlock.dataset.gallery; //define galleryId

        //If we have no gallery, stop the embed
        if(!gallery) return;

        //Generate iFrame
        var iframe = document.createElement('iframe');
        iframe.src = WEB_ROOT + '/embed/' + gallery;
        iframe.width = '100%';
        iframe.height ='100%';
        iframe.style.cssText = '\
            border: 0;\
            margin: 0;\
            padding:0;\
            -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
               -mox-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
                    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12);\
            display: block;\
            background: rgb(255, 255, 255);\
        ';
        
        //Insert iframe after blockquote
        embedParent.insertBefore(iframe, embedBlock.nextSibling);

        //Remove blockquote
        embedParent.removeChild(embedBlock);
    };
})();