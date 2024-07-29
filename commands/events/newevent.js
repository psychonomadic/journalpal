const { SlashCommandBuilder } = require('discord.js');
const { GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord-api-types/v9');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Create a new guild event')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The name of the event')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description of the event')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('start_time')
                .setDescription('Start time of the event (YYYY-MM-DD HH:MM format)')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const startTime = interaction.options.getString('start_time');
        const eventStartTime = new Date(startTime);

        try {
            const event = await interaction.guild.scheduledEvents.create({
                name: name,
                description: description,
                scheduledStartTime: eventStartTime,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.External,
                entityMetadata: {
                    location: 'Online'  
                }
            });

            await interaction.reply(`Event created: ${event.name}`);
        } catch (error) {
            console.error('Error creating the event:', error);
            await interaction.reply({ content: 'There was an error while creating the event.', ephemeral: true });
        }
    },
};
