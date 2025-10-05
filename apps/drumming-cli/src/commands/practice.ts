import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { DatabaseService, Rudiment } from '../services/database';

export const practiceCommand = new Command('practice')
  .description('Practice routines and exercises')
  .option('-e, --exercise <name>', 'Specific exercise to practice')
  .option('-d, --duration <minutes>', 'Practice duration in minutes', '10')
  .action(async (options) => {
    const db = new DatabaseService();
    let selectedExercise: Rudiment;

    if (options.exercise) {
      const foundExercise = db.getAllRudiments().find(ex => 
        ex.name.toLowerCase().includes(options.exercise.toLowerCase())
      );
      
      if (!foundExercise) {
        console.error(chalk.red(`Exercise "${options.exercise}" not found.`));
        console.log(chalk.yellow('Available exercises:'));
        db.getAllRudiments().forEach(ex => {
          console.log(chalk.gray(`  - ${ex.name} (${ex.difficulty})`));
        });
        process.exit(1);
      }
      selectedExercise = foundExercise;
    } else {
      // Interactive exercise selection
      const { exercise } = await inquirer.prompt([
        {
          type: 'list',
          name: 'exercise',
          message: 'Choose a practice exercise:',
          choices: db.getAllRudiments().map(ex => ({
            name: `${ex.name} (${ex.difficulty}) - ${ex.description}`,
            value: ex
          }))
        }
      ]);
      selectedExercise = exercise;
    }

    const duration = parseInt(options.duration) * 60; // Convert to seconds
    const actualDuration = Math.min(duration, selectedExercise.duration * 60);

    console.log(chalk.cyan('🥁 Practice Session Starting'));
    console.log(chalk.yellow(`Exercise: ${selectedExercise.name}`));
    console.log(chalk.yellow(`Description: ${selectedExercise.description}`));
    console.log(chalk.yellow(`Difficulty: ${selectedExercise.difficulty}`));
    console.log(chalk.yellow(`Duration: ${actualDuration / 60} minutes`));
    if (selectedExercise.url) {
      console.log(chalk.blue(`Learn more: ${selectedExercise.url}`));
    }
    console.log(chalk.gray('Press Ctrl+C to stop early'));
    console.log('');

    const spinner = ora('Practicing...').start();
    let elapsed = 0;
    const interval = 1000; // Update every second

    const practiceInterval = setInterval(() => {
      elapsed += 1;
      const remaining = actualDuration - elapsed;
      const progress = (elapsed / actualDuration) * 100;

      if (remaining > 0) {
        spinner.text = `Practicing ${selectedExercise.name}... ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} remaining (${progress.toFixed(1)}%)`;
      } else {
        clearInterval(practiceInterval);
        spinner.succeed(chalk.green(`Practice session completed! Great job! 🎉`));
        console.log(chalk.cyan('Keep up the great work!'));
        process.exit(0);
      }
    }, interval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(practiceInterval);
      spinner.stop();
      console.log(chalk.yellow('\nPractice session ended early.'));
      console.log(chalk.gray(`You practiced for ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`));
      process.exit(0);
    });
  });
