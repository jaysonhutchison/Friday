require('dotenv').config();
const apiaiApp = require('apiai')(process.env.AI_TOKEN);
const Discord = require('discord.js');
const client = new Discord.Client();
const id = require('./restart.json');
client.on('ready', function (evt) {
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
    client.user.setActivity('Female Replacement Intelligent Digital Assistant Youth');
    if (id.id == '618571488697647127') client.users.get('359988404316012547').send('Restarted!');
    else client.channels.find(x => x.id === id.id).send('Restarted!');
});

const timediff = require('timediff');
const getTimeDiffAndTimeZone = require('city-country-timezone');


const formatDate = function(d) {
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Fridar','Saturday'];
    return {
        day: days[d.getDay()],
        month: months[d.getMonth()],
        date: d.getDate(),
        year: d.getFullYear(),
        hours: hours%12,
        minutes: minutes,
        ampm: ampm
    };
};

let contexts = [];
client.on('message', message => {
    const prefixes = [`<@${client.user.id}> `, process.env.prefix, 'friday', 'ok friday', 'hey friday'];
    if (message.author.bot) return;
    let prefix = false;
    for (const i of prefixes) {
        if (message.content.toLowerCase().startsWith(i)) prefix = i;
    }
    if (prefix == process.env.PREFIX) {
        if (message.author.id === '359988404316012547') {
            try {
                let args = message.content.slice(prefix.length).trim().split(/ +/g),
                command = args.shift().toLowerCase(),
                commandFile = require(`./commands/${command}.js`);
                commandFile(client, message, args);
            } catch(e) {
                message.channel.send(e.message);
            }
        }
        return;
    }
    if (message.content.toLowerCase().indexOf(prefix) !== 0 && message.channel.type !== 'dm') return;
    message.channel.startTyping();
try {
    let text = message.content.substring(prefix.length);
    let request = apiaiApp.textRequest(text, {
        sessionId: message.author.id,
        contexts: contexts
    });
    request.on('response', (response) => {
        message.channel.stopTyping();
        let args = response.result.parameters, text = response.result.fulfillment.speech, res = '';
        if (text == 'code') {
            let a = function(q, value) {
                if (typeof q != 'object') q = [q];
                console.log(q);
                for (let i = 0; i < q.length; i ++) {
                    if (response.result.metadata.intentName == q[i]) {
                        res = typeof value == 'function' ? value() : value;
                    }
                }
            };
            a('date.between', function() {return timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`});
            a(['date.check', 'date.check - context:date-check', 'date.day_of_week'], function() {
                const location = typeof args.location == 'string' ? args.location : args.location.country;
                const { timezone, time_diff } = getTimeDiffAndTimeZone(location);
                let time = new Date();
                let tzDifference = time_diff * 60;
                let t = formatDate(new Date(time.getTime() + tzDifference * 60 * 1000));
                contexts.push({
                    name: 'date.check',
                    parameters: args
                });
                return {embed: {
                    color: 0xff6300,
                    title: `Time in ${location}`,
                    fields: [{
                        name: `${t.hours}:${t.minutes} ${t.ampm}`,
                        value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
                    }]
                }};
            });
        } else res = text;
        message.channel.send(res);
    });
    request.on('error', (e) => {
        message.channel.stopTyping();
        if (message.author.id === "359988404316012547") message.reply(e.message);
        else message.channel.send("Oops, there was an error on our end.");
    });
    request.end();
} catch(e) {
    if (message.author.id === "359988404316012547") message.reply(e.message);
    else message.channel.send("Oops, there was an error on our end.");
}
});

client.login(process.env.DISCORD_TOKEN);
