import dotenv from "dotenv";
import {
    Client,
    GatewayIntentBits,
    Routes,
    Events,
    AuditLogEvent,
    EmbedBuilder,
    Collection
} from "discord.js";

//SETUP MODULES
dotenv.config();

//VARIABLES
const TOKEN = process.env.TOKEN;
const ban_coll = new Collection();
const unban_coll = new Collection();

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
    if (ban_coll.has(ban.guild.id) && ban_coll.get(ban.guild.id) === ban.user.id) {
        ban_coll.delete(ban.guild.id);
        return;
    }
    console.log(`${ban.user.tag} 님은 ${ban.guild.name} 서버에서 차단 되었습니다.`);

    client.guilds.cache.forEach(guild => {

        ban.user.send(`당신은 \`${ban.guild.name}\` 서버에서 차단 되었습니다.\n따라서, \`${guild.name}\` 서버에서도 차단 되었습니다.`).catch(() => {});

        ban_coll.set(guild.id, ban.user.id);
        guild.bans.create(ban.user.id, {
            reason: `${ban.user.tag} 님은 ${ban.guild.name} 서버에서 차단 되었습니다.`
        });
    });

    const embed = new EmbedBuilder()
        .setTitle(`<a:attention:1058939472848375819> 연동 차단 | \`${ban.user.tag}\`님 <a:attention:1058939472848375819>`)
        .setDescription(`\` 🆔 디스코드 아이디:\` ${ban.user}\n\` 🔖 사유:\` 파트너 서버(\`${ban.guild.name}\`)에서 차단 되었습니다.`)
        .setColor(process.env.RED_EMBED_COLOR);

    if (ban.guild.id !== process.env.MAIN_GUILD_ID) {
        await (await (await client.guilds.fetch(process.env.MAIN_GUILD_ID)).channels.fetch(process.env.PUNISHMENT_LOG_CHANNEL_ID)).send({embeds: [embed]});
    }
});

client.on(Events.GuildBanRemove, async (ban) => {
    if (unban_coll.has(ban.guild.id) && unban_coll.get(ban.guild.id) === ban.user.id) {
        unban_coll.delete(ban.guild.id);
        return;
    }
    console.log(`${ban.user.tag} 님은 ${ban.guild.name} 서버에서 차단 해제 되었습니다.`);

    client.guilds.cache.forEach(guild => {
        ban.user.send(`당신은 \`${ban.guild.name}\` 서버에서 차단 해제 되었습니다.\n따라서, \`${guild.name}\` 서버에서도 차단 해제 되었습니다.`).catch(() => {});

        if (guild.bans.cache.has(ban.user.id)) {
            unban_coll.set(guild.id, ban.user.id);
            guild.bans.remove(ban.user.id);
        }
    });
});