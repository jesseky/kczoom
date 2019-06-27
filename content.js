/**
 * content.js
 * Chrome 缩略图放大插件
 * Author: Jesse
 **/

/* jshint esversion: 6 */

// bind click image event
var Querys = [{
  url: 'oschina.net',
  query: '.logs .tweet .img img, .UserLogs .photo img, .multimgs img, .osc-avatar img[src*="!/both/"]',
  from: /_thumb|!\/.*$/,
  to: ''
},
{
  url: 'oschina.net',
  query: 'img.SmallPortrait, img.LargePortrait, .tweet-vote-user img,.user-icon img, img.tweet-portrait, img.portrait, img.voter, .tweet .tweet-uimg, .osc-avatar img[src*="_50."]',
  from: /_\d+/,
  to: '_200',
  to2: '_100'
},
{
  url: 'oschina.net',
  query: 'img.multing',
  from: '(V)',
  to: ''
},
{
  url: 'zhihu.com',
  query: '.zhi img.avatar, .zhi img.Avatar, .zhi img.side-topic-avatar, .zhi img.zm-item-img-avatar, img.avatar.avatar-small, .author img.avatar-small, img.Avatar, .Avatar--xs,.RichContent-cover-inner img',
  from: /_[msl]|_xs|_xl|_is|_im|_\d+x\d+/,
  to: '',
  style: {
    '.RichContent-cover-inner': {
      zIndex: 2
    }
  }
},
{
  url: 'douban.com',
  //query: '.user-face .pil, .obu .nbg .m_sub_img, #db-usr-profile .pic img, .basic-info .userface, .member-list .pic img.imgnoga, .comment-item .pic img, #friend .list img.show-title, .status-item .usr-pic a img, .mod-usercard .pic a img',
  query: 'img[src*=".doubanio.com/icon/u"]:not(.kcimage-content-img)',
  from: /icon\/u[a-z]?/,
  to: 'icon/ur',
  to2: 'icon/ul',
},
{
  url: 'jianshu.com',
  query: '.avatar img,.cover img,.wrap-img img,.avatar-collection img,.avatar[style*="background-image"],.cover[style*="background-image"]',
  from: /\?.*$/,
  to: ''
}
];
var Decodes = {
  'oschina.net': '.comment-item .extra.text, .tweet-item .extra.text'
};

var ImgCon = null;
var CurrentURL = document.location.href;
var MutationOb = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver; // moz is not required

function kcHideSourceImage() {
  ImgCon.classList.add('kc-fadeOut');
  setTimeout(function () {
    ImgCon.classList.remove('kc-fadeOut');
    ImgCon.style.display = 'none';
  }, 600);
}

function kcHideOrShowLoading(isShow) {
  if (ImgCon) {
    ImgCon.querySelector('.kcimage-loading').style.display = typeof isShow !== 'undefined' && isShow ? 'flex' : 'none';
  }
}

function kcLoadImage(ImgCon, img, source, callback, callerror) {
  var load = new Image();
  load.onload = function () {
    kcHideOrShowLoading();
    img.setAttribute('src', source);
    img.classList.add('kcimage-zoom-out');
    var h = (load.naturalWidth > ImgCon.offsetWidth ? ImgCon.offsetWidth / load.naturalWidth : 1) * load.naturalHeight;
    if (h > ImgCon.offsetHeight) {
      ImgCon.querySelector('section').classList.add('kcimage-content-cont-block');
      ImgCon.querySelector('section').scrollTop = (h - ImgCon.offsetHeight) / 2;
    }
    setTimeout(function () {
      img.classList.add('kc-bounceIn');
    }, 0);
    if (typeof callback === 'function') {
      callback();
    }
  };
  load.onerror = function () {
    if (typeof callerror === 'function') {
      callerror();
    }
  };
  load.src = source;
}

function kcLoadSourceImage(elm, iq) {
  var img;
  if (!ImgCon) {
    ImgCon = document.createElement('div');
    ImgCon.setAttribute('id', 'kcimage_content');
    ImgCon.setAttribute('class', 'kcimage-content');
    ImgCon.innerHTML = '<div class="kcimage-content-in"><b class="kcimage-content-close">×</b><div class="kcimage-loading"></div><section class="kcimage-content-cont"></section></div>';
    document.body.appendChild(ImgCon);
    ImgCon.querySelector('.kcimage-loading').innerHTML = '<div class="kc-loading"></div>';
    ImgCon.querySelector('.kcimage-content-close').addEventListener('click', function (evt) {
      kcHideSourceImage();
    }, false);
    ImgCon.querySelector('section').addEventListener('click', function (evt) {
      if (evt.target === ImgCon.querySelector('img')) {
        kcHideSourceImage();
      }
    }, false);
    ImgCon.addEventListener('mousewheel', function (evt) { // DOMMouseScroll , -evt.detail * 40
      ImgCon.querySelector('section').scrollTop -= evt.wheelDeltaY;
      evt.preventDefault();
      evt.stopPropagation();
    }, false);
    img = new Image();
    img.setAttribute('class', 'kcimage-content-img');
    ImgCon.querySelector('section').appendChild(img);
  } else {
    img = ImgCon.querySelector('img');
  }
  var url = elm.src || window.getComputedStyle(elm).backgroundImage || '';
  if (!url) {
    return;
  }
  var mch = url.match(/^url\("(.*)"\)$/);
  if (null !== mch) {
    url = mch[1];
  }
  kcHideOrShowLoading('show');
  ImgCon.querySelector('section').classList.remove('kcimage-content-cont-block');
  ImgCon.querySelector('section').scrollTop = 0;
  ImgCon.style.display = 'block';
  img.src = url;
  img.classList.remove('kcimage-zoom-out');
  kcLoadImage(ImgCon, img, iq.from ? url.replace(iq.from, iq.to || '') : url, function () {
    // success;
  }, function () {
    if (iq.from && typeof iq.to2 !== 'undefined') {
      kcLoadImage(ImgCon, img, url.replace(iq.from, iq.to2), function () {
        //success;
      }, function () {
        kcHideOrShowLoading();
      });
    } else {
      kcHideOrShowLoading();
    }
  });
}

function b64DecodeUnicode(str) {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
  } catch (e) {
    return '';
  }
}

function isbase64(v) {
  return /^[a-zA-Z0-9_\-\/=\+]{5,}$/.test(v.trim());
}

function b64DecodeInfinity(str) {
  let [n, m, s, p] = [0, 1e3, '', str];
  do {
    p = b64DecodeUnicode(p);
    if (p) { s = p; n++; }
  } while (p && isbase64(p) && n < m);
  return [s, n];
}

function kcBindAllEvents() {
  Querys.filter(iq => CurrentURL.indexOf(iq.url) > -1).forEach(function (iq) {
    [...document.querySelectorAll(iq.query.split(',').map(i => i + ":not(.kcimage-zoom)").join(','))].forEach(function (img) {
      img.kcBoundEvent = true;
      img.style.cursor = 'zoom-in';
      img.classList.add('kcimage-zoom');
      img.addEventListener('click', function (evt) {
        kcLoadSourceImage(img, iq);
        evt.preventDefault();
        evt.stopPropagation();
      }, true);
    });
    if (iq.style) {
      for (var q in iq.style) {
        [...document.querySelectorAll(q)].filter(e => !e.kcSettedStyle).forEach(function (el) {
          for (var k in iq.style[q]) {
            el.style[k] = iq.style[q][k];
          }
          el.kcSettedStyle = true;
        });
      }
    }
  });
  for (let u in Decodes) {
    if (CurrentURL.indexOf(u) > -1) {
      [...document.querySelectorAll(Decodes[u])].forEach(dom => {
        if (!dom.KCDecoded) {
          dom.KCDecoded = true;
          var content = dom.textContent || dom.innerText || '';
          var decdoms = content.split(/[\s\t\n]+/).filter(v => /^[a-zA-Z0-9_\-\/=\+]{5,}$/.test(v)).map(v => {
            let [t, n] = b64DecodeInfinity(v); // b64DecodeUnicode(v); // 支持无限 base64 解码
            return t ? `<section class="kc-decoded-item"><blockquote>${v}</blockquote><strong>${n}次</strong><p>${t}</p></section>` : '';
          }).join('');
          if (decdoms) {
            var div = document.createElement('div');
            div.className = 'kc-decoded';
            div.innerHTML = decdoms;
            dom.nextSibling ? dom.parentNode.insertBefore(div, dom.nextSibling) : dom.parentNode.appendChild(div);
          }
        }
      });
    }
  }
}
kcBindAllEvents();

if (MutationOb) {
  var mo = new MutationOb(kcBindAllEvents);
  mo.observe(document.body, {
    'childList': true,
    'subtree': true
  });
} else {
  document.addEventListener('DOMNodeInserted', function () { // content changed
    kcBindAllEvents();
  }, false);
}