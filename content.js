/**
 * content.js
 * Chrome 缩略图放大插件
 * Author: Jesse
 **/

/* jshint esversion: 6 */

// bind click image event
var Querys = [{
    url: 'oschina.net',
    query: '.logs .tweet .img img, .UserLogs .photo img, .multimgs img',
    from: '_thumb',
    to: ''
  },
  {
    url: 'oschina.net',
    query: 'img.SmallPortrait, img.LargePortrait, .tweet-vote-user img,.user-icon img, img.tweet-portrait, img.portrait, img.voter, .tweet .tweet-uimg',
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
    query: '.zhi img.avatar, .zhi img.Avatar, .zhi img.side-topic-avatar, .zhi img.zm-item-img-avatar, img.avatar.avatar-small, .author img.avatar-small, img.Avatar, .Avatar--xs',
    from: /_[msl]|_xs|_xl|_is|_im/,
    to: ''
  },
  {
    url: 'douban.com',
    //query: '.user-face .pil, .obu .nbg .m_sub_img, #db-usr-profile .pic img, .basic-info .userface, .member-list .pic img.imgnoga, .comment-item .pic img, #friend .list img.show-title, .status-item .usr-pic a img, .mod-usercard .pic a img',
    query: 'img[src*=".doubanio.com/icon/u"]:not(.kcimage-content-img)',
    from: /icon\/u[a-z]?/,
    to: 'icon/ur',
    to2: 'icon/ul',
  }
];
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
  kcHideOrShowLoading('show');
  ImgCon.querySelector('section').classList.remove('kcimage-content-cont-block');
  ImgCon.querySelector('section').scrollTop = 0;
  ImgCon.style.display = 'block';
  img.src = elm.src;
  img.classList.remove('kcimage-zoom-out');
  kcLoadImage(ImgCon, img, iq.from ? elm.src.replace(iq.from, iq.to || '') : elm.src, function () {
    // success;
  }, function () {
    if (iq.from && typeof iq.to2 !== 'undefined') {
      kcLoadImage(ImgCon, img, elm.src.replace(iq.from, iq.to2), function () {
        //success;
      }, function () {
        kcHideOrShowLoading();
      });
    } else {
      kcHideOrShowLoading();
    }
  });
}

function kcBindAllEvents() {
  Querys.filter(iq => CurrentURL.indexOf(iq.url) > -1).forEach(function (iq) {
    [...document.querySelectorAll(iq.query.split(',').map(i=>i+":not(.kcimage-zoom)").join(','))].forEach(function (img) {
      img.kcBoundEvent = true;
      img.style.cursor = 'zoom-in';
      img.classList.add('kcimage-zoom');
      img.addEventListener('click', function (evt) {
        kcLoadSourceImage(img, iq);
        evt.preventDefault();
        evt.stopPropagation();
      }, true);
    });
  });
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