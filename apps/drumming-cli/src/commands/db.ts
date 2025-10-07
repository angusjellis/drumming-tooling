import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { DatabaseService } from '../services/database';

const db = new DatabaseService();

export const dbCommand = new Command('db')
  .description('Manage the drumming database (rudiments and songs)')
  .addCommand(createRudimentCommand())
  .addCommand(createSongCommand())
  .addCommand(createListCommand())
  .addCommand(createDeleteCommand());

function createRudimentCommand(): Command {
  return new Command('add-rudiment')
    .description('Add a new rudiment to the database')
    .action(async () => {
      const nameQuestion = {
        type: 'input' as const,
        name: 'name',
        message: 'Rudiment name:',
        validate: (input: any) => {
          if (typeof input === 'string' && input.trim() !== '') {
            return true;
          }
          return 'Name is required';
        }
      };

      const descriptionQuestion = {
        type: 'input' as const,
        name: 'description',
        message: 'Description:',
        validate: (input: any) => {
          if (typeof input === 'string' && input.trim() !== '') {
            return true;
          }
          return 'Description is required';
        }
      };

      const durationQuestion = {
        type: 'number' as const,
        name: 'duration',
        message: 'Duration (minutes):',
        default: 5,
        validate: (input: any) => {
          if (typeof input === 'number' && input > 0) {
            return true;
          }
          return 'Duration must be positive';
        }
      };

      const difficultyQuestion = {
        type: 'list' as const,
        name: 'difficulty',
        message: 'Difficulty:',
        choices: ['beginner', 'intermediate', 'advanced']
      };

      const urlQuestion = {
        type: 'input' as const,
        name: 'url',
        message: 'Drumeo URL (optional):',
        default: null
      };

      const answers = await inquirer.prompt([
        nameQuestion,
        descriptionQuestion,
        durationQuestion,
        difficultyQuestion,
        urlQuestion
      ] as any);

      try {
        const rudiment = db.addRudiment({
          name: answers.name,
          description: answers.description,
          duration: answers.duration,
          difficulty: answers.difficulty,
          url: answers.url || null,
          platform: answers.platform
        });

        console.log(chalk.green(`✅ Added rudiment: ${rudiment.name}`));
        console.log(chalk.blue(`ID: ${rudiment.id}`));
      } catch (error) {
        console.error(chalk.red('Error adding rudiment:'), error);
      }
    });
}

function createSongCommand(): Command {
  return new Command('add-song')
    .description('Add a new song to the database')
    .action(async () => {
      const titleQuestion = {
        type: 'input' as const,
        name: 'title',
        message: 'Song title:',
        validate: (input: any) => {
          if (typeof input === 'string' && input.trim() !== '') {
            return true;
          }
          return 'Title is required';
        }
      };

      const artistQuestion = {
        type: 'input' as const,
        name: 'artist',
        message: 'Artist:',
        validate: (input: any) => {
          if (typeof input === 'string' && input.trim() !== '') {
            return true;
          }
          return 'Artist is required';
        }
      };

      const descriptionQuestion = {
        type: 'input' as const,
        name: 'description',
        message: 'Description:',
        validate: (input: any) => {
          if (typeof input === 'string' && input.trim() !== '') {
            return true;
          }
          return 'Description is required';
        }
      };

      const tempoQuestion = {
        type: 'number' as const,
        name: 'tempo',
        message: 'Tempo (BPM):',
        default: 120,
        validate: (input: any) => {
          if (typeof input === 'number' && input > 0) {
            return true;
          }
          return 'Tempo must be positive';
        }
      };

      const difficultyQuestion = {
        type: 'list' as const,
        name: 'difficulty',
        message: 'Difficulty:',
        choices: ['beginner', 'intermediate', 'advanced']
      };

      const urlQuestion = {
        type: 'input' as const,
        name: 'url',
        message: 'Drumeo URL (optional):',
        default: null
      };

      const answers = await inquirer.prompt([
        titleQuestion,
        artistQuestion,
        descriptionQuestion,
        tempoQuestion,
        difficultyQuestion,
        urlQuestion
      ] as any);

      try {
        const song = db.addSong({
          title: answers.title,
          artist: answers.artist,
          description: answers.description,
          tempo: answers.tempo,
          length: answers.length,
          platform: answers.platform,
          difficulty: answers.difficulty,
          url: answers.url || null
        });

        console.log(chalk.green(`✅ Added song: ${song.title} by ${song.artist}`));
        console.log(chalk.blue(`ID: ${song.id}`));
      } catch (error) {
        console.error(chalk.red('Error adding song:'), error);
      }
    });
}

function createListCommand(): Command {
  return new Command('list')
    .description('List all rudiments and songs')
    .option('-r, --rudiments', 'List only rudiments')
    .option('-s, --songs', 'List only songs')
    .option('-d, --difficulty <level>', 'Filter by difficulty')
    .action((options) => {
      if (options.rudiments || (!options.songs && !options.rudiments)) {
        console.log(chalk.cyan('\n🥁 Rudiments:'));
        console.log(chalk.gray('─'.repeat(80)));
        
        let rudiments = db.getAllRudiments();
        if (options.difficulty) {
          rudiments = rudiments.filter(r => r.difficulty === options.difficulty);
        }
        
        rudiments.forEach(rudiment => {
          console.log(chalk.yellow(`• ${rudiment.name}`));
          console.log(chalk.gray(`  ${rudiment.description}`));
          console.log(chalk.gray(`  Difficulty: ${rudiment.difficulty} | Duration: ${rudiment.duration}min`));
          if (rudiment.url) {
            console.log(chalk.blue(`  URL: ${rudiment.url}`));
          }
          console.log('');
        });
      }

      if (options.songs || (!options.songs && !options.rudiments)) {
        console.log(chalk.cyan('\n🎵 Songs:'));
        console.log(chalk.gray('─'.repeat(80)));
        
        let songs = db.getAllSongs();
        if (options.difficulty) {
          songs = songs.filter(s => s.difficulty === options.difficulty);
        }
        
        songs.forEach(song => {
          console.log(chalk.yellow(`• ${song.title} by ${song.artist}`));
          console.log(chalk.gray(`  ${song.description}`));
          console.log(chalk.gray(`  Difficulty: ${song.difficulty} | Tempo: ${song.tempo} BPM`));
          if (song.url) {
            console.log(chalk.blue(`  URL: ${song.url}`));
          }
          console.log('');
        });
      }
    });
}

function createDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a rudiment or song')
    .option('-r, --rudiment <id>', 'Delete rudiment by ID')
    .option('-s, --song <id>', 'Delete song by ID')
    .action(async (options) => {
      if (options.rudiment) {
        const rudiment = db.getRudimentById(options.rudiment);
        if (!rudiment) {
          console.error(chalk.red(`Rudiment with ID "${options.rudiment}" not found`));
          return;
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete rudiment "${rudiment.name}"?`,
            default: false
          }
        ]);

        if (confirm) {
          const success = db.deleteRudiment(options.rudiment);
          if (success) {
            console.log(chalk.green(`✅ Deleted rudiment: ${rudiment.name}`));
          } else {
            console.error(chalk.red('Failed to delete rudiment'));
          }
        }
      } else if (options.song) {
        const song = db.getSongById(options.song);
        if (!song) {
          console.error(chalk.red(`Song with ID "${options.song}" not found`));
          return;
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete song "${song.title}" by ${song.artist}?`,
            default: false
          }
        ]);

        if (confirm) {
          const success = db.deleteSong(options.song);
          if (success) {
            console.log(chalk.green(`✅ Deleted song: ${song.title}`));
          } else {
            console.error(chalk.red('Failed to delete song'));
          }
        }
      } else {
        console.error(chalk.red('Please specify --rudiment <id> or --song <id>'));
      }
    });
}
