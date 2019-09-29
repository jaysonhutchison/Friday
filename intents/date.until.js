module.exports = (client, message, args) => {
    let h1 = new Date(args.date),
    h2 = new Date();
    h1.setDate(h1.getDate()+1);
    if (h1.getTime() < h2.getTime()) {
        h1.setMonth(h1.getMonth() + 12);
    }
    let d1 = client.formatDate(h2), d2 = client.formatDate(h1);
    message.channel.send({embed: {
        color: client.color,
        fields: [{
            name: `${Math.abs(timediff(h1, h2, args.unit[0].toUpperCase())[args.unit+'s'])} ${args.unit}s`,
            value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
        }]
    }});
}