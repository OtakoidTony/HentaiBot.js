const Discord = require('discord.js');
const request = require('request');
const {
    prefix,
    token,
} = require('./config.json');

function randomItem(a) {
    return a[Math.floor(Math.random() * a.length)];
}

/**
 * ms to HHMMSS
 */
String.prototype.toHHMMSS = function () {
    var myNum = parseInt(this, 10);
    var hours = Math.floor(myNum / 3600000);
    var minutes = Math.floor((myNum - (hours * 3600000)) / 60000);
    var seconds = Math.floor((myNum - (hours * 3600000) - (minutes * 60000)) / 1000);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

String.prototype.replaceAll = function (org, dest) {
    return this.split(org).join(dest);
}

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    if (!message.channel.nsfw) {
        message.channel.send("이 봇은 NSFW 채널 외에서는 작동할 수 없습니다.");
        return;
    }
    if (message.content.startsWith(`${prefix}gelbooru`)) {
        gelbooru(message);
    }
    if (message.content.startsWith(`${prefix}yandere`)) {
        yandere(message);
    }
    if (message.content.startsWith(`${prefix}ehentai`)) {
        ehentai(message);
    }
    if (message.content.startsWith(`${prefix}hanime`)) {
        hanime(message);
    }
    if (message.content.startsWith(`${prefix}help`)) {
        help(message);
    }
});

async function help(message) {
    result = "```\n";
    result += `${prefix}gelbooru [tags]\n`
    result += `  Gelbooru로부터 이미지를 불러옵니다.\n`;
    result += `${prefix}yandere [tags]\n`
    result += `  Yandere로부터 이미지를 불러옵니다.\n`;
    result += `${prefix}hanime [title]\n`
    result += `  HTV로부터 성인 애니메이션 정보를 불러옵니다.\n`;
    result += "```"
    return message.channel.send(result);
}

async function gelbooru(message) {
    const tag = message.content.substring(`${prefix}gelbooru`.length + 1, message.content.length);
    const url = "https://gelbooru.com//index.php?page=dapi&s=post&q=index&json=1&tags=" + tag;

    let options = {
        uri: url,
        method: 'GET',
        json: true
    };
    request.get(options, function (err, httpResponse, body) {
        var res = randomItem(body);
        console.info(res);
        const embed = new Discord.RichEmbed()
            .setTitle('Gelbooru API')
            .setImage(res.file_url)
            .setFooter(res.created_at);
        message.channel.send(embed);
    });
}

async function yandere(message) {
    const tag = message.content.substring(`${prefix}yandere`.length + 1, message.content.length).replaceAll(' ', '+');
    const url = "https://yande.re/post.json?tags=" + tag;

    let options = {
        uri: url,
        method: 'GET',
        json: true
    };
    request.get(options, function (err, httpResponse, body) {
        var res = randomItem(body);
        console.info(res);
        const embed = new Discord.RichEmbed()
            .setTitle('Yandere API')
            .setImage(res.file_url)
            .setFooter(res.created_at);
        message.channel.send(embed);
    });
}

async function ehentai(message) {
    const url = message.content.substring(`${prefix}ehentai`.length + 1, message.content.length);
    const gallery_list = url.split("e-hentai.org/g/")[1].split('/');
    const gallery_id = parseInt(gallery_list[0], 10);
    const gallery_token = gallery_list[1];

    let options = {
        uri: "https://api.e-hentai.org/api.php",
        method: 'POST',
        body: {
            "method": "gdata",
            "gidlist": [
                [gallery_id, gallery_token]
            ],
            "namespace": 1
          },
        json: true
    };
    request.post(options, function (err, httpResponse, body) {
        console.info(body);
        const res =  body.gmetadata[0];
        const embed = new Discord.RichEmbed()
            .setTitle(res.title)
            .setURL(url)
            .setImage(res.thumb)
        message.channel.send(embed);
    });
}

async function hanime(message) {
    const title = message.content.substring(`${prefix}hanime`.length + 1, message.content.length);
    const url = "https://members.hanime.tv/api/v5/hentai-videos/" + title.replaceAll(' ', '-');
    let options = {
        uri: url,
        method: 'GET',
        headers: {
            'User-Agent': "Mozilla/5.0",
            'X-Directive': "api"
        },
        json: true
    };
    request.get(options, function (err, httpResponse, body) {
        console.info(body.hentai_video);
        const res = body.hentai_video;
        const embed = new Discord.RichEmbed()
            .setTitle(res.name)
            .setURL("https://hanime.tv/videos/hentai/" + title.replaceAll(' ', '-'))
            .setDescription(res.brand)
            .setThumbnail(res.cover_url)
            .addField('시청수', res.views, true)
            .addField('흥미있음', res.interests, true)
            .addField('시간', `${res.duration_in_ms}`.toHHMMSS(), true)
            .addField('좋아요', res.likes, true)
            .addField('싫어요', res.dislikes, true)
            .addField('다운로드수', res.downloads, true)
            .setImage(res.poster_url)
            .setFooter(res.released_at);

        message.channel.send(embed);
    });
}

client.login(token);