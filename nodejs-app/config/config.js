/**
 * Loads environment variables.
 *
 * Environment variables are set using the NODE_ENV variable. For example, to
 * run in production, one should run:
 *
 *   NODE_ENV=production node index.js
 *
 * If no environment is specified, the "development" environment is assumed
 * by default.
 * 
 * In this hackathon, I will assume only development
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const configPath = `./config/development.env`

require('dotenv').config({ path: configPath })