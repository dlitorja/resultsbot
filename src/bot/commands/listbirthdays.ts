import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { supabase } from '../../database/supabase.js';
import { logger } from '../../utils/logger.js';
import { COLORS, EMOJIS } from '../../config/constants.js';
import { DateTime } from 'luxon';

export default {
  data: new SlashCommandBuilder()
    .setName('listbirthdays')
    .setDescription('List upcoming birthdays'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const { data: birthdays, error } = await supabase
        .from('birthdays')
        .select('*')
        .order('birth_date', { ascending: true });

      if (error) {
        throw error;
      }

      if (!birthdays || birthdays.length === 0) {
        await interaction.editReply({
          content: `${EMOJIS.INFO} No birthdays have been added yet.`,
        });
        return;
      }

      // Get current date
      const now = DateTime.now();
      const currentYear = now.year;

      // Calculate next occurrence for each birthday
      const upcomingBirthdays = birthdays
        .map((birthday) => {
          const birthDate = DateTime.fromISO(birthday.birth_date);
          let nextBirthday = birthDate.set({ year: currentYear });

          // If birthday has passed this year, use next year
          if (nextBirthday < now) {
            nextBirthday = nextBirthday.plus({ years: 1 });
          }

          const daysUntil = Math.ceil(nextBirthday.diff(now, 'days').days);

          return {
            userId: birthday.user_id,
            date: birthDate.toFormat('MMMM dd'),
            daysUntil,
            age: birthday.birth_year ? currentYear - birthday.birth_year : null,
          };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.BIRTHDAY} Upcoming Birthdays`)
        .setColor(COLORS.PRIMARY)
        .setDescription(
          upcomingBirthdays
            .slice(0, 10) // Show up to 10
            .map((b) => {
              const ageStr = b.age ? ` (turning ${b.age})` : '';
              const daysStr = b.daysUntil === 0 ? 'Today!' : `in ${b.daysUntil} days`;
              return `<@${b.userId}> - ${b.date}${ageStr} - ${daysStr}`;
            })
            .join('\n')
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error({ error }, 'Failed to list birthdays');
      await interaction.editReply({
        content: `${EMOJIS.ERROR} Failed to retrieve birthdays. Please try again.`,
      });
    }
  },
};

