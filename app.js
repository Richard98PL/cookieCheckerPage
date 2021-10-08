const http = require('http')
const https = require('https')
const url = require('url')
const crypto = require('crypto');

const USER_AGENT = 'user-agent';
const ALGORYTHM = 'md5';
const GENUS_COOKIE_NAME = 'genusCookie';
const HEX = 'hex';
const METADATA = 'metadata';
const HOST = 'genusone-developer-edition.eu40.force.com'
const ENDPOINT = '/services/apexrest/service'
const HTTP_METHOD = 'POST'
const IMAGE_METHOD = 'GET'
const ENDPOINT_PORT = 443
const CONTENT_TYPE = 'Content-Type'
const APPLICATION_JSON = 'application/json'
const METADATA_URL_PARAMETER = 'metadata'
const HASH_URL_PARAMETER = 'hash'

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
    let isExistingCookieEmpty = existing_genus_cookie == null || existing_genus_cookie == '';
    let hash = '';

    if(isExistingCookieEmpty){
        let userAgent = req.headers[USER_AGENT];
        let date = new Date();
        let key = userAgent.toString() + date.toString();
        hash = crypto.createHash(ALGORYTHM).update(key).digest(HEX);
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
    return isExistingCookieEmpty ? hash : existing_genus_cookie;
}

async function handleTrackingParameters(req, cookie){
    let search_params = url.parse(req.url,true).query;
    let metadata = search_params[METADATA];

    let options = {
      host: HOST,
      path: ENDPOINT + '?' + HASH_URL_PARAMETER + '=' + cookie + '&' + METADATA_URL_PARAMETER + '=' + metadata,
      method: HTTP_METHOD,
      port: ENDPOINT_PORT,
      headers: {
        CONTENT_TYPE : APPLICATION_JSON
      }
    };
    
    const sfReq = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
      })
      
    sfReq.on('error', error => {
    console.error(error)
    })
    sfReq.end();
}

const server = http.createServer(function(req,res) {
    switch (req.method){
        case IMAGE_METHOD:
            console.log(IMAGE_METHOD);
            let cookie = cookieManagement(req, res);
            handleTrackingParameters(req, cookie);
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
