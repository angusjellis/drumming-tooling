#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { metronomeCommand } from './commands/metronome';
import { practiceCommand } from './commands/practice';
import { rhythmCommand } from './commands/rhythm';
import { dbCommand } from './commands/db';

const program = new Command();

program
  .name('drumming-cli')
  .description('A CLI tool to help with drumming practice and learning')
  .version('1.0.0');

// Add commands
program.addCommand(metronomeCommand);
program.addCommand(practiceCommand);
program.addCommand(rhythmCommand);
program.addCommand(dbCommand);

// Add a welcome message
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('🎵 Welcome to Drumming CLI! 🥁'));
  console.log('');
  console.log(chalk.yellow('Available commands:'));
  console.log('  metronome    Start a metronome with customizable tempo');
  console.log('  practice     Practice routines and exercises');
  console.log('  rhythm       Learn and practice different rhythms');
  console.log('  db           Manage the drumming database');
  console.log('');
  console.log(chalk.gray('For more information on a specific command, use:'));
  console.log(chalk.gray('  drumming-cli <command> --help'));
});

// Parse command line arguments
program.parse();
