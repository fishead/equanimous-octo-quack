'use strict';

const app = require('express')();
const co = require('co');
// const debug = require('debug')('eztv:routes:show');
const util = require('./util');
const _shows = {};
const _episodes = {};


const searchShows = () => (req, res, next) => {
  co(function *() {
    const shows = yield util.getShows();
    shows.forEach(show => (_shows[show.id] = show));
    res.json({
      error: false,
      data: shows
    });
  }).catch(next);
};

const fetchShow = () => (req, res, next) => {
  co(function *() {
    const show = _shows[req.params.showId];
    res.json({
      error: false,
      data: show,
    });
  }).catch(next);
};

const searchEpisodes = () => (req, res, next) => {
  co(function *() {
    const show = _shows[req.params.showId];
    const episodes = yield util.getShowEpisodes(show);
    show.episodes = episodes;
    episodes.forEach(episode => (_episodes[episode.id] = episode));
    res.json({
      error: false,
      data: episodes,
    });
  }).catch(next);
};

const fetchEpisode = () => (req, res, next) => {
  co(function *() {
    const episode = _episodes[req.params.episodeId];
    res.json({
      error: false,
      data: episode,
    });
  }).catch(next);
};


module.exports = function (config) {
  app.get('/', searchShows(config));
  app.get('/:showId', fetchShow(config));
  app.get('/:showId/episodes', searchEpisodes(config));
  app.get('/:showId/episodes/:episodeId', fetchEpisode(config));

  return app;
};
