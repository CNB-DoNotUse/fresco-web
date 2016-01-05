
  window.onload = function() {
    var urlParams = {};
    (function () {
        var pair, // Really a match. Index 0 is the full match; 1 & 2 are the key & val.
            tokenize = /([^&=]+)=?([^&]*)/g,
            // decodeURIComponents escapes everything but will leave +s that should be ' '
            re_space = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
            // Substring to cut off the leading '?'
            querystring = window.location.search.substring(1);

        while (pair = tokenize.exec(querystring))
           urlParams[re_space(pair[1])] = re_space(pair[2]);
    })();

    var base = 'https://www.parse.com';
    var id = 'fresco-staging';
    document.getElementById('reset-form').setAttribute('action', base + '/apps/' + id + '/request_password_reset');
    document.getElementById('username').value = urlParams['username'];

    document.getElementById('token').value = urlParams['token'];
    if (urlParams['error']) {
      document.getElementById('error').appendChild(document.createTextNode(urlParams['error']));
    }
    if (urlParams['app']) {
      document.getElementById('app').appendChild(document.createTextNode(' for ' + urlParams['app']));
    }
  }