'use strict';

const cheerio = require('cheerio');
const string = require('string');
const co = require('co');
const fetch = require('isomorphic-fetch');


const urlRoot = 'https://eztv.ch/';
// var urlRoot = "https://eztv-proxy.net/";


const self = module.exports;

self.getShows = co.wrap(function*(options) {
  const showlistHtml = yield fetch(`${urlRoot}showlist/`);
  const showlistText = yield showlistHtml.text();
  const list = [];
  const $ = cheerio.load(showlistText);
  const $elements = $('table.forum_header_border tr[name=hover]');
  $elements.each((i, e) => {
    const show = {};
    show.url = $(e).find('.thread_link').attr('href');
    if (!show.url) {
      // console.log(e);
      return;
    }
    const regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
    if (!regex) {
      // console.log("Unparsed show: " + show.url);
      return;
    }
    show.id = parseInt(regex[1], 10);
    show.slug = regex[2];

    let title = $(e).find('.thread_link').text();
    if (string(title).endsWith(', The')) {
      title = `The ${string(title).chompRight(', The').s}`;
    }
    show.title = title;
    show.status = $(e).find('td').find('font').attr('class');
    show.votes = parseInt($(e).find('span').text().match(/ \((\d+) votes\)/)[1], 10);
    show.score = parseFloat($(e).find('b').text());

    if (options && options.query) {
      if (show.title.toLowerCase().search(options.query.toLowerCase()) >= 0) {
        // console.log(show.title);
        list.push(show);
      }
    } else {
      list.push(show);
    }
  });
  return list;
});


self.getShowEpisodes = co.wrap(function*(show) {
  const showHtml = yield fetch(`${urlRoot}shows/${show.id}/${show.slug}/`);
  const showText = yield showHtml.text();
  const episodes = [];

  const $ = cheerio.load(showText);

  const $episodes = $('table.forum_header_noborder tr[name=hover]');
  $episodes.each((i, e) => {
    const episode = {};

    episode.url = $(e).find('td').eq(1).find('a').attr('href');
    if (!episode.url) {
      return;
    }
    const urlRegex = episode.url.match(/\/ep\/(\d+)\/.*/);
    if (urlRegex) {
      episode.id = parseInt(urlRegex[1], 10);
    }

    episode.title = $(e).find('td').eq(1).find('a').text();
    const titleRegex = episode.title.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);
    if (titleRegex) {
      episode.show = titleRegex[1];
      episode.seasonNumber = parseInt(titleRegex[2], 10);
      episode.episodeNumber = parseInt(titleRegex[3], 10);
      episode.episodeNumber2 = parseInt(titleRegex[5], 10);
      episode.extra = titleRegex[6].trim();
      episode.proper = episode.extra.toLowerCase().indexOf('proper') >= 0;
      episode.repack = episode.extra.toLowerCase().indexOf('repack') >= 0;
    } else {
      // console.log('unparsed episode: ' + episode.title);
    }

    episode.magnet = $(e).find('td').eq(2).find('a.magnet').attr('href');
    episode.torrentURL = $(e).find('td').eq(2).find('a.download_1').attr('href');

    episodes.push(episode);
  });
  return episodes;
});
