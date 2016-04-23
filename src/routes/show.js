'use strict';

const app = require('express')();
const co = require('co');
// const debug = require('debug')('eztv:routes:show');
const util = require('./util');
const entities = {
  shows: {},
  episodes: {},
};
const _shows = [];
const _episodes = [];


const searchShows = () => (req, res, next) => {
  co(function *() {
    let shows = _shows.map(showId => entities.shows[showId]);
    if (shows.length === 0) {
      shows = yield util.getShows();
      shows.forEach(show => {
        entities.shows[show.id] = show;
        _shows.push(show.id);
      });
    }
    res.json({
      error: false,
      data: shows
    });
  }).catch(next);
};

const fetchShow = () => (req, res, next) => {
  co(function *() {
    const show = entities.shows[req.params.showId];
    res.json({
      error: false,
      data: show,
    });
  }).catch(next);
};

const searchEpisodes = () => (req, res, next) => {
  co(function *() {
    const show = entities.shows[`${req.params.showId}`];
    let episodes = show.episodes;
    if (!episodes || episodes.length === 0) {
      episodes = yield util.getShowEpisodes(show);
      show.episodes = episodes;
    }
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
