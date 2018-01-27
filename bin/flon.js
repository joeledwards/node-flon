#!/usr/bin/env node

const yargs = require('yargs')

function config () {
  return yargs
    .env('FLON')
    .option('file', {
      type: 'string',
      desc: 'read from specified file instead of stdin',
      alias: ['f']
    })
    .option('url', {
      type: 'string',
      desc: 'read from specified URL instead of stdin',
      alias: ['u'],
      conflicts: ['file']
    })
    .help()
    .argv
}

async function run () {
  const r = require('ramda')
  const unmarshal = require('../lib/unmarshal')

  let source = 'stdin'
  try {
    const {file, url} = config()
    const output = process.stdout

    if (file) {
      source = file
      const fs = require('fs')
      await unmarshal(fs.createReadStream(file), output)
    } else if (url) {
      source = url
      const axios = require('axios')
      const {data} = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })
      await unmarshal(data, output)
    } else {
      process.stdin.resume()
      await unmarshal(process.stdin, output)
    }
  } catch (error) {
    console.error(
      `Error reading content from ${source ? source : 'stdin'} :`,
      error
    )
  }
}

run()
