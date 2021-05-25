import { api } from '../../ts/_vars.js';
const query = new URLSearchParams(location.search);
const player = document.querySelector('#player');
var plyr;
var vtt = [];
function vttToString(vtt) {
    var output = 'WEBVTT';
    for (var i = 0; i < vtt.length; i++) {
        const from = `${new Date(vtt[i].time.from * 1000).toISOString().substr(11, 11)}0`;
        const to = `${new Date(vtt[i].time.to * 1000).toISOString().substr(11, 11)}0`;
        output += `\n\n${from} --> ${to}\n${vtt[i].text}`;
    }
    return output;
}
document.getElementById('subs').value;
const eps = query.get('v');
fetch(`${api}/v2/metadata/video/episode/${eps}`).then(res => res.json()).then(init);
function init(metadata) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (((_b = (_a = metadata.posters) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) == 'image/webp' || metadata.thumbnail.endsWith('.webp')) {
        if (supportsWebp()) {
            document.querySelector('video').setAttribute('poster', ((_d = (_c = metadata.posters) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.src) || metadata.thumbnail);
        }
        else {
            document.querySelector('video').setAttribute('poster', ((_f = (_e = metadata.posters) === null || _e === void 0 ? void 0 : _e[1]) === null || _f === void 0 ? void 0 : _f.src) || metadata.thumbnail.replace('.webp', '.jpg'));
        }
    }
    else {
        document.querySelector('video').setAttribute('poster', ((_h = (_g = metadata.posters) === null || _g === void 0 ? void 0 : _g[1]) === null || _h === void 0 ? void 0 : _h.src) || metadata.thumbnail.replace('.webp', '.jpg'));
    }
    const controls = [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings'
    ];
    const settings = [
        'quality',
        'speed'
    ];
    // @ts-ignore (typescript thinks that Plyr doesn't exist when it does)
    plyr = new Plyr(player, {
        controls,
        settings,
        autoplay: true,
        disableContextMenu: false,
        previewThumbnails: {
            src: `/api/v2/previews/${eps}`
        }
    });
    plyr.source = {
        type: 'video',
        title: metadata.title,
        sources: metadata.sources || [{ src: metadata.video, type: 'video/mp4', size: 1080 }]
    };
    plyr.currentTrack = 1; //Turn on captions
    //Define metadata fields
    const pagetitle = document.getElementById('pagetitle');
    const title = document.getElementById('title');
    const season = document.getElementById('season');
    const episode = document.getElementById('episode');
    //Set metadata
    title.innerText = metadata.title;
    //If this is the specials season, then set metadata.seasonname to 'Specials'
    if (metadata.season === 0) {
        metadata.seasonname = 'Specials';
    }
    else {
        metadata.seasonname = `Season ${metadata.season}`;
    }
    pagetitle.innerText = `${metadata.seasonname} - Episode ${metadata.episode} - ${metadata.title}`;
    season.innerText = metadata.seasonname;
    episode.innerText = `Episode ${metadata.episode}`;
    document.getElementById('subs').addEventListener('change', () => {
        setVTT(document.getElementById('subs').value, metadata);
    });
}
setInterval(displayVTT, 100);
function displayVTT() {
    if (!document.querySelector('.plyr__captions')) {
        const plyr__captions = document.createElement('div');
        plyr__captions.classList.add('plyr__captions');
        plyr__captions.style.display = 'block';
        plyr__captions.innerHTML = '<span class="plyr__caption"></span>';
        document.querySelector('.plyr').appendChild(plyr__captions);
    }
    if (document.querySelector('.plyr__captions').style.display !== 'block') {
        document.querySelector('.plyr__captions').style.display = 'block';
    }
    if (!document.querySelector('.plyr__captions .plyr__caption')) {
        const plyr__caption = document.createElement('span');
        plyr__caption.classList.add('plyr__caption');
        document.querySelector('.plyr__captions').appendChild(plyr__caption);
    }
    var hasCaption = false;
    for (var i = 0; i < vtt.length; i++) {
        if (vtt[i].time.from < plyr.currentTime && vtt[i].time.to > plyr.currentTime) {
            hasCaption = true;
            document.querySelector('.plyr__caption').innerHTML = vtt[i].text;
        }
    }
    if (!hasCaption) {
        document.querySelector('.plyr__caption').innerHTML = '';
    }
}
function setVTT(text, metadata) {
    vtt.push({
        text,
        time: {
            from: plyr.currentTime,
            to: plyr.currentTime + 10
        }
    });
    localStorage.setItem(`unsaved-sub-${query.get('v')}`, JSON.stringify(vtt));
    console.log(vttToString(vtt));
}
document.getElementById('back').addEventListener('click', () => {
    localStorage.setItem(`unsaved-sub-${query.get('v')}`, JSON.stringify(vtt));
    location.href = '/';
});
function supportsWebp() {
    var elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    }
    else {
        // very old browser like IE 8, canvas not supported
        return false;
    }
}
//# sourceMappingURL=main.js.map