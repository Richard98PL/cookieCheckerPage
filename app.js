const { write } = require('fs');
const http = require('http')
const url = require('url')
const fs = require('fs')
const crypto = require('crypto');
const GENUS_COOKIE_NAME = 'genusCookie';
const port = 3000

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function cookieManagement(req, res){
    let cookies = parseCookies(req);
    let existing_genus_cookie = cookies[GENUS_COOKIE_NAME];

    if(existing_genus_cookie == null || existing_genus_cookie == ''){
        let userAgent = req.headers['user-agent'];
        let date = new Date();
        let key = userAgent.toString() + date.toString();
        let hash = crypto.createHash('md5').update(key).digest('hex');
        //In your case, since MD5 is a 128-bit hash, 
        //the probability of a collision is less than 2 ^(-100). 
        //You'd need about 2 64 records before the probability of a collision rose to 50%
        res.writeHead(200, {
            'Set-Cookie': GENUS_COOKIE_NAME + '=' + hash + 'domain=.genusone.com; path=/; expires=Wed, 08 Oct 2031 10:09:04 GMT; Secure; SameSite=None',
            'Content-Type': 'image/gif',
            'Transfer-Encoding' : 'chunked',
            'Connection' : 'keep-alive',
            'X-Frame-Options' : 'SAMEORIGIN',
            'X-XSS-Protection' : '1; mode=block',
            'X-Content-Type-Options' : 'nosniff',
            'Content-Disposition' : 'inline',
            'Content-Transfer-Encoding' : 'binary',
            'Cache-Control' : 'private',
        });
    }
    console.log(res);
}

function handleTrackingParameters(req){
    
}

const server = http.createServer(function(req,res) {
    switch (req.method){
        case 'GET':
            console.log('GET');
            cookieManagement(req, res);
            handleTrackingParameters(req);
            break;
    }
    res.end();
})

server.listen(port, function(error){
    if(error){
        console.log('Something went werong', error)
    }else{
        console.log('Server is listening on port ' + port)
    }
})
