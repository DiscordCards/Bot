# Discord Cards Source
Last Version: 1.8.0 Dock

## Notes before you yell at me:
1. Last update was in 08/22/2017
2. Cooldowns in memory was meant as a **temporary** solution
3. In odd cases where the RDB connection dies, the shard stops responding to messages until connection is regained
4. Many commands still use the defunt website `discord.cards`
5. The external emojis are from both a Material Icons discord server and a private server
6. Some admin commands are still using private channel IDs and are mean't to be ran in the main server
7. Discord.JS may or may not be old

## What you need
- RethinkDB
- Redis
- ImageMagick
- Node.js

## Config Keys
| Property | Type | Description |
| -------- | ---- | ----------- |
| token | string | The token to the bot |
| prefix.default | string | The prefix that the bot will use. |
| prefix.use_name | bool | Whether or not to use the name of th ebot as a prefix. |
| owner | string | The Discord ID of the person hosting the bot. |
| devs | string array | The Discord IDs of the other maintainers. |
| dbotsgg | string | The API token for discord.bots.gg. |
| carbon | string | The API token for carbonitex.net. |
| dborg | string | The API token for discordbots.org. |
| listcord | string | The API token for listcord. |
| r.user | string | The rethink user. |
| r.password | string | The password to the rethink user. |
| r.url | string | The host (IP or domain) that rethink is being hosted in. |
| r.port | number | The port that rethink is occupying. (normally is always 28015) |
| r.db | string | The database to use. |
| report_url | string | The webhook URL to send reports to. |
| status_url | string | The webhook URL to send shard updates to. |
| lnotif | string | The webhook URL to send limited notifs to. |
| weblate | string | The weblate API key used by the `pt` command. |
| weblate_url | string | The weblate base URL. |
| shards | number OR `"auto"` | The number of shards to spawn when spawning shards, setting this to `"auto"` will use the recommended amount of shards by Discord. |
| debug | bool | Whether or not to run debug stuff. |
| version | string | The version of the bot. |