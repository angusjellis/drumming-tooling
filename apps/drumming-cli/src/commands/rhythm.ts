import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { DatabaseService, Song } from '../services/database';

export const rhythmCommand = new Command('rhythm')
  .description('Learn and practice different rhythms')
  .option('-r, --rhythm <name>', 'Specific rhythm to practice')
  .option('-t, --tempo <bpm>', 'Override tempo in BPM')
  .option('-d, --duration <minutes>', 'Practice duration in minutes', '5')
  .action(async (options) => {
    const db = new DatabaseService();
    let selectedRhythm: Song;

    if (options.rhythm) {
      const foundRhythm = db.getAllSongs().find(song => 
        song.title.toLowerCase().includes(options.rhythm.toLowerCase())
      );
      
      if (!foundRhythm) {
        console.error(chalk.red(`Rhythm "${options.rhythm}" not found.`));
        console.log(chalk.yellow('Available rhythms:'));
        db.getAllSongs().forEach(song => {
          console.log(chalk.gray(`  - ${song.title} (${song.difficulty})`));
        });
        process.exit(1);
      }
      selectedRhythm = foundRhythm;
    } else {
      // Interactive rhythm selection
      const { rhythm } = await inquirer.prompt([
        {
          type: 'list',
          name: 'rhythm',
          message: 'Choose a rhythm to practice:',
          choices: db.getAllSongs().map(song => ({
            name: `${song.title} (${song.difficulty}) - ${song.description}`,
            value: song
          }))
        }
      ]);
      selectedRhythm = rhythm;
    }

    const tempo = options.tempo ? parseInt(options.tempo) : selectedRhythm.tempo;
    const duration = parseInt(options.duration) * 60; // Convert to seconds

    console.log(chalk.cyan('🥁 Rhythm Practice Starting'));
    console.log(chalk.yellow(`Rhythm: ${selectedRhythm.title}`));
    console.log(chalk.yellow(`Artist: ${selectedRhythm.artist}`));
    console.log(chalk.yellow(`Description: ${selectedRhythm.description}`));
    console.log(chalk.yellow(`Tempo: ${tempo} BPM`));
    console.log(chalk.yellow(`Difficulty: ${selectedRhythm.difficulty}`));
    console.log(chalk.yellow(`Duration: ${duration / 60} minutes`));
    if (selectedRhythm.url) {
      console.log(chalk.blue(`Learn more: ${selectedRhythm.url}`));
    }
    console.log(chalk.gray('Press Ctrl+C to stop'));
    console.log('');

    const spinner = ora('Playing rhythm...').start();
    let elapsed = 0;
    const interval = 1000; // Update every second
    const beatInterval = 60000 / tempo; // Beat interval in milliseconds
    let beatCount = 0;

    // Start the rhythm pattern
    const rhythmInterval = setInterval(() => {
      beatCount++;
      const beatInMeasure = ((beatCount - 1) % 4) + 1;
      
      // Visual beat indicator
      if (beatInMeasure === 1) {
        spinner.text = chalk.green(`🔴 BEAT ${beatCount} - ${selectedRhythm.title}`);
      } else {
        spinner.text = chalk.blue(`🔵 beat ${beatCount} - ${selectedRhythm.title}`);
      }

      // Audio feedback (console beep)
      process.stdout.write('\x07');
    }, beatInterval);

    // Duration timer
    const durationInterval = setInterval(() => {
      elapsed += 1;
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        clearInterval(rhythmInterval);
        clearInterval(durationInterval);
        spinner.succeed(chalk.green(`Rhythm practice completed! 🎉`));
        console.log(chalk.cyan('Great job practicing!'));
        process.exit(0);
      }
    }, interval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(rhythmInterval);
      clearInterval(durationInterval);
      spinner.stop();
      console.log(chalk.yellow('\nRhythm practice ended early.'));
      console.log(chalk.gray(`You practiced for ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`));
      process.exit(0);
    });
  });
