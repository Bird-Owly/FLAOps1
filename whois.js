const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Fetch Roblox user information')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username to lookup')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');

    try {
      // Get Roblox userId from username
      const userId = await noblox.getIdFromUsername(username);

      // Get user info (includes join date, blurb = bio)
      const userInfo = await noblox.getUserInfo(userId);

      // Get groups the user belongs to
      const groups = await noblox.getGroups(userId);

      // Get friend count (noblox lacks direct getFriendsCount, so getFriends length)
      const friends = await noblox.getFriendCount(userId);
      const friendCount = friends; 

      // Avatar URL (standard Roblox headshot)
      const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

      // Base embed fields count = 4 (ID, Join Date, Friends, Bio)
      // Discord max fields = 25, so max groups to show = 21
      const maxGroups = 15;

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle(`👤 Roblox User: ${username}`)
        .setColor('Red')
        .setThumbnail(avatarUrl)
        .addFields(
          { name: '🆔 User ID', value: userId.toString(), inline: true },
          { name: '📅 Join Date', value: `<t:${userInfo.created.getTime()}>` ?? 'Unknown', inline: true },
          { name: '🧑‍🤝‍🧑 Friends', value: friendCount, inline: true },
          { name: '📜 Bio', value: userInfo.description && userInfo.description.trim() !== '' ? userInfo.description : 'No bio set.', inline: false }
        );

      if (groups.length > 0) {
        const groupsToShow = groups.slice(0, maxGroups);
        for (const group of groupsToShow) {
          embed.addFields({
            name: `🏛️ ${group.Name}`,
            value: `• Rank: ${group.Role}`,
            inline: false
          });
        }

        if (groups.length > maxGroups) {
          embed.addFields({
            name: '🏛️ More groups',
            value: `And ${groups.length - maxGroups} more groups...`,
            inline: false
          });
        }
      } else {
        embed.addFields({ name: '🏛️ Groups', value: 'User is not in any groups.', inline: false });
      }

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to fetch Roblox user info. Make sure the username is correct.', ephemeral: true });
    }
  }
};
