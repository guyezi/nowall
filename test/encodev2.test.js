var should = require('should') 
  , options = {
      baseURL:'https://nowall.be'
    , serverAndPort: 'nowall.be'
    , whiteList: ['github.com', 'plusone.google.com'] // test hostname only, not url
    , debug: true
    }
  , e = encodeURIComponent
  , encode = require('../lib/encodev2')(options);

describe('encodev2', function(){

    describe('encodeUrl', function(){

        it('should ?px!', function(){
            encode.encodeUrl('http://www.twitter.com').should.equal(
              'https://nowall.be/?px!=http://www.twitter.com');
        })

        it('should not equal host', function(){
            // complex query
            encode.encodeUrl('http://groups.google.com/?p1=v1&p2=v2').should.equal('https://nowall.be/?p1=v1&p2=v2&px!=http://groups.google.com');

            encode.encodeUrl('http://hello.foo-bar.com.hk/path/to/path?p1=v1&p2=v2')
              .should.equal('https://nowall.be/path/to/path?p1=v1&p2=v2&px!=http://hello.foo-bar.com.hk');

            // anchor
            encode.encodeUrl('http://test.com/?p1=v1&p2=v2#anchor')
              .should.equal('https://nowall.be/?p1=v1&p2=v2&px!=http://test.com#anchor');

            // path
            encode.encodeUrl('http://test.com/foo/bar.jpg#anchor')
              .should.equal('https://nowall.be/foo/bar.jpg?px!=http://test.com#anchor');
            // whiteList
            encode.encodeUrl('http://github.com').should.equal('http://github.com');
            encode.encodeUrl('http://guileen.github.com').should.equal('http://guileen.github.com');
        })
    });

    describe('decodeUrl', function() {
        it('should match ?px!', function() {
            encode.decodeUrl('/?px!=http://twitter.com')
              .should.equal('http://twitter.com/');
        });

        it('should match &px!', function(){
            encode.decodeUrl('/p/to/p?p1=v1&px!=https://twitter.com#anchor')
              .should.equal('https://twitter.com/p/to/p?p1=v1#anchor');
        });

        it('should match referer', function() {
            encode.decodeUrl('/foo?p1=v1#foo', 'https://nowall.be/?px!=https://t.cn#anchor')
              .should.equal('https://t.cn/foo?p1=v1#foo');
            should.not.exist(encode.decodeUrl('/abcde?q=v#anchor'));
        });

        it('should parse root url', function() {
            encode.decodeUrl('https://ssl.nowall.be/?px!=http://test.com')
              .should.equal('http://test.com/');
        })

        it('should parse full url', function() {
            encode.decodeUrl('https://nowall.be/foo?p1=v1&px!=http://t.cn#anchor')
              .should.equal('http://t.cn/foo?p1=v1#anchor');
        })
    });

    describe('encodeScript', function(){
        it('should not equal encodedScript', function(){
            console.log(encode.encodeScript('domain.xx="twitter.com";'))
            console.log(encode.encodeScript('domain.xx="www.google.com.hk";'))
            console.log(encode.encodeScript('domain.xx="www.goo-gle.com.hk";'))
            console.log(encode.encodeScript('"api":"http:\\/\\/a2.twimg.com\\/a\\/1302888170\\/javascripts\\/api.bundle.js", hostname.match(/(^(www|api)\\.)?twitter\\.com$/) '))
        })
    });

    describe('encodeBody', function(){
        it('should handle none scheme', function() {
            var encodedBody = encode.encodeBody('blabla<script id="www-core-js" src="//s.ytimg.com/yt/jsbin/www-core-vflb497eV.js"></script>blabla');
            encodedBody.should.equal('blabla<script id="www-core-js" src="https://nowall.be/yt/jsbin/www-core-vflb497eV.js?px!=http://s.ytimg.com"></script>blabla')
        })

        it('should script', function(){
            var encodedBody = encode.encodeBody('<script>var x="douban.com";</script><a href="http://www.douban.com">www.douban.com</a><cite>www.douban.com/<b>test</b>/</cite><script type="text/javascript">var x="douban.com";\nl"api":"http:\\/\\/a2.twimg.com\\/a\\/1302888170\\/javascripts\\/api.bundle.js", \nhostname.match(/(^(www|api)\\.)?twitter\\.com$/)</script>', false)
            encodedBody.should.equal('<script>var x="douban.com";</script><a href="https://nowall.be/?px!=http://www.douban.com">www.douban.com</a><cite>www.douban.com/<b>test</b>/</cite><script type="text/javascript">var x="douban.com";\nl"api":"https:\\/\\/nowall.be\\/a\\/1302888170\\/javascripts\\/api.bundle.js?px!=http:\\/\\/a2.twimg.com", \nhostname.match(/(^(www|api)\\.)?twitter\\.com$/)</script>')
        })

        it('should css', function() {
            var encodedBody = encode.encodeBody('<link type="text/css" rel="stylesheet" href="http://static.ak.fbcdn.net/rsrc.php/v1/y2/r/8Sr4ddHR5zZ.css" />', false);
            encodedBody.should.equal('<link type="text/css" rel="stylesheet" href="https://nowall.be/rsrc.php/v1/y2/r/8Sr4ddHR5zZ.css?px!=http://static.ak.fbcdn.net" />')
        })

        it('should youtube', function() {
            var script = ' var swf = "  s\\u0072c=\\"https:\\/\\/s.ytimg.com\\/yt\\/swfbin\\/watch_as3-vflF75dGN.swf\\"   ;ad3_module=https%3A%2F%2Fs.ytimg.com%2Fyt%2Fswfbin%2Fad3-vflr05jiO.swf\\u0026amp;enablecsi=1\\u0026amp;iv3_module=https%3A%2F%2Fs.ytimg.com%2Fyt%2Fswfbin%2Fiv3_module-vflfak9F6.swf\\u0026amp;gut_tag=%2F4061%2Fytpwmpu%2Fmain_471\\u0026amp"';
            var encodedScript = encode.encodeScript(script);
            encodedScript.should.equal(' var swf = "  s\\u0072c=\\"https:\\/\\/nowall.be\\/yt\\/swfbin\\/watch_as3-vflF75dGN.swf?px!=https:\\/\\/s.ytimg.com\\"   ;ad3_module=https%3A%2F%2Fnowall.be%2Fyt%2Fswfbin%2Fad3-vflr05jiO.swf%3Fpx!%3Dhttps%3A%2F%2Fs.ytimg.com\\u0026amp;enablecsi=1\\u0026amp;iv3_module=https%3A%2F%2Fnowall.be%2Fyt%2Fswfbin%2Fiv3_module-vflfak9F6.swf%3Fpx!%3Dhttps%3A%2F%2Fs.ytimg.com\\u0026amp;gut_tag=%2F4061%2Fytpwmpu%2Fmain_471\\u0026amp"');

            script = ' var swf = "  flashvars=\\"url=http%3A%2F%2Fo-o.preferred.nuq04s10.v5.lscache4.c.youtube.com%2Fvideoplayback%3Fupn%3Ds0XIsevkJTA%26sparams&quality=medium';
            encodedScript = encode.encodeScript(script);
            encodedScript.should.equal(' var swf = "  flashvars=\\"url=https%3A%2F%2Fnowall.be%2Fvideoplayback%3Fupn%3Ds0XIsevkJTA%26sparams%26px!%3Dhttp%3A%2F%2Fo-o.preferred.nuq04s10.v5.lscache4.c.youtube.com&quality=medium');

            script = 'this.lf&&Rh(Se("https://plusone.google.com/_/+1/confirm",{url:a.url,source:"google:youtube"}),{width:480,height:550}))};'
            encodedScript = encode.encodeScript(script);
            encodedScript.should.equal(script);
        })
    });

    describe('decodeQuery', function(){
        var decodedQuery = encode.decodeQuery('pstMsg=&dnConn=&continue=http%3A%2F%2Fwww.qyyqvo-myw.posts.li%2F&dsh=4529719864886304822&hl=zh-CN&timeStmp=&secTok=&GALX=x2eIIz7c7Oo&Email=gg&Passwd=gg&PersistentCookie=yes&rmShown=1&signIn=%E7%99%BB%E5%BD%95&asts=')

        var decodedPathAndQuery = encode.decodePathAndQuery('/account/auth/?pstMsg=&dnConn=&continue=http%3A%2F%2Fwww.qyyqvo-myw.posts.li%2F&dsh=4529719864886304822&hl=zh-CN&timeStmp=&secTok=&GALX=x2eIIz7c7Oo&Email=gg&Passwd=gg&PersistentCookie=yes&rmShown=1&signIn=%E7%99%BB%E5%BD%95&asts=')
    });

    describe('decodeRequestV2', function() {
        it('should return null', function(){
            should.not.exist(encode.decodeRequestV2({
                  url: '/here'
                , headers: {
                    referer: '/'
                  }
            }));
        });

        it('should return https://t.com', function() {
            var opt = encode.decodeRequestV2({
                url: '/p/2/p?px!=https://t.com'
            });
            opt.host.should.equal('t.com');
            opt.isSecure.should.be.true;
            opt.path.should.equal('/p/2/p');

        });

        it('should use referer', function() {
            var opt = encode.decodeRequestV2({
                url: '/path?query#anchor'
              , headers: {
                  referer: 'https://nowall.be/refpath?px!=http://t.com#anchor'
                }
            })
            opt.host.should.equal('t.com');
            opt.isSecure.should.be.false;
            opt.headers.referer.should.equal('http://t.com/refpath#anchor')
            opt.path.should.equal('/path?query#anchor');
        })
    })

    describe('encodeResponseV2', function() {
        it('should not unlimited redirect', function() {
            var res = encode.encodeResponseHeaders({
                location: 'http://google.com/search?q=test'
            });
            res.location.should.equal('https://nowall.be/search?q=test&px!=http://google.com')
        })

        it('should parse relative redirection', function() {
            var res = encode.encodeResponseHeaders({
                location: '/j?k='
              }, {
                host: 'test.com'
              , port: 443
              , isSecure: true
            });
            res.location.should.equal('https://nowall.be/j?k=&px!=https://test.com')
        });
    })

})
