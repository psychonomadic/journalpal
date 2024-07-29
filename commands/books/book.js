const { SlashCommandBuilder } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('book')
        .setDescription('Fetches book details from Open Library')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the book to search for')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('olid')
                .setDescription('Open Library ID of the book for detailed info (e.g., OL123M)')
                .setRequired(false)),
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const olid = interaction.options.getString('olid');

        if (title) {
            // Search by title
            try {
                const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
                const books = response.data.docs;
                if (!books.length) {
                    await interaction.reply('No books found.');
                    return;
                }
                const book = books[0];
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(book.title)
                    .setURL(`https://openlibrary.org${book.key}`)
                    .setDescription('Click the title for more details!')
                    .setThumbnail(`http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`)
                    .addFields(
                        { name: 'Author', value: book.author_name.join(', '), inline: true },
                        { name: 'First Published', value: book.first_publish_year.toString(), inline: true }
                    );
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Failed to fetch book details.', ephemeral: true });
            }
        } else if (olid) {
            // Get detailed info by OLID
            try {
                const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=OLID:${olid}&format=json&jscmd=data`);
                const bookData = response.data[`OLID:${olid}`];
                if (!bookData) {
                    await interaction.reply('No details found for this book.');
                    return;
                }
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(bookData.title)
                    .setURL(bookData.url)
                    .setDescription('Detailed book information.')
                    .setThumbnail(bookData.cover ? bookData.cover.large : '')
                    .addFields(
                        { name: 'Author', value: bookData.authors.map(author => author.name).join(', '), inline: true },
                        { name: 'Publishers', value: bookData.publishers.map(publisher => publisher.name).join(', '), inline: true },
                        { name: 'Publish Date', value: bookData.publish_date, inline: true }
                    );
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Failed to fetch book details.', ephemeral: true });
            }
        } else {
            // If no option provided
            await interaction.reply('Please provide either a title to search or an OLID for detailed information.');
        }
    },
};
