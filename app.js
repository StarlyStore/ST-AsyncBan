import dotenv from "dotenv";
import {
    Client,
    GatewayIntentBits,
    Routes,
    Events,
    AuditLogEvent
} from "discord.js";

//SETUP MODULES
dotenv.config();

//VARIABLES
const TOKEN = process.env.TOKEN;

///SETUP CLIENT
const client = await new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ]});
await client.login(TOKEN).then(() => {
    console.log(`Logged in as ${client.user.tag}`);
});

//LISTENERS
client.on(Events.GuildBanAdd, async (ban) => {
    console.log(`${ban.user.tag} 님은 ${ban.guild.name} 서버에서 차단 되었습니다.`);

    client.guilds.cache.forEach(guild => guild.members.fetch(ban.user.id).catch(() => {}).then(member => {
        if (member) {
            member.ban();
            member.user.send(`당신은 \`${member.guild.name}\` 서버에서 차단 되었습니다.\n따라서, \`${guild.name}\` 서버에서도 차단 되었습니다.`).catch(() => {});
        }
    }));
});

client.on(Events.GuildBanRemove, async (ban) => {
    console.log(`${ban.user.tag} 님은 ${ban.guild.name} 서버에서 차단 해제 되었습니다.`);

    client.guilds.cache.forEach(guild => {
        if (guild.bans.cache.has(ban.user.id)) guild.bans.remove(ban.user.id);
        ban.user.send(`당신은 \`${member.guild.name}\` 서버에서 차단 해제 되었습니다.\n따라서, \`${guild.name}\` 서버에서도 차단 해제 되었습니다.`).catch(() => {});
    });
});