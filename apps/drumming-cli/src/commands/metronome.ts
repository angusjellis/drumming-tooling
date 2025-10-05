import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const metronomeCommand = new Command('metronome')
  .description('Start a metronome with customizable tempo')
  .option('-t, --tempo <bpm>', 'Tempo in beats per minute', '120')
  .option('-s, --subdivision <subdivision>', 'Subdivision (1, 2, 4, 8)', '4')
  .option('-d, --duration <seconds>', 'Duration in seconds (0 for infinite)', '0')
  .action(async (options) => {
    const tempo = parseInt(options.tempo);
    const subdivision = parseInt(options.subdivision);
    const duration = parseInt(options.duration);

    if (tempo < 30 || tempo > 300) {
      console.error(chalk.red('Error: Tempo must be between 30 and 300 BPM'));
      process.exit(1);
    }

    if (![1, 2, 4, 8].includes(subdivision)) {
      console.error(chalk.red('Error: Subdivision must be 1, 2, 4, or 8'));
      process.exit(1);
    }

    console.log(chalk.cyan('🥁 Starting Metronome'));
    console.log(chalk.yellow(`Tempo: ${tempo} BPM`));
    console.log(chalk.yellow(`Subdivision: ${subdivision}`));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    console.log('');

    const intervalMs = (60000 / tempo) / subdivision;
    let beatCount = 0;
    let startTime = Date.now();

    const spinner = ora('Playing...').start();

    const metronomeInterval = setInterval(() => {
      beatCount++;
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;

      // Visual beat indicator
      const beatInMeasure = ((beatCount - 1) % subdivision) + 1;
      const isDownbeat = beatInMeasure === 1;
      
      if (isDownbeat) {
        spinner.text = chalk.green(`🔴 BEAT ${beatCount} (${elapsed.toFixed(1)}s)`);
      } else {
        spinner.text = chalk.blue(`🔵 beat ${beatCount} (${elapsed.toFixed(1)}s)`);
      }

      // Audio feedback (console beep)
      process.stdout.write('\x07');

      // Check duration limit
      if (duration > 0 && elapsed >= duration) {
        clearInterval(metronomeInterval);
        spinner.succeed(chalk.green(`Metronome completed after ${duration} seconds`));
        process.exit(0);
      }
    }, intervalMs);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(metronomeInterval);
      spinner.stop();
      console.log(chalk.yellow('\nMetronome stopped.'));
      process.exit(0);
    });
  });
