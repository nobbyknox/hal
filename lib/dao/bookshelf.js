'use strict';

var knexConfig = require('./knex-config.js');
var knex = require('knex')(knexConfig[process.env.HAL_ENV]);
var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
