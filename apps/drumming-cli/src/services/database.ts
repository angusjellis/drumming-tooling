import * as fs from 'fs';
import * as path from 'path';

export interface Rudiment {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  description: string;
  tempo: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  rudiments: Rudiment[];
  songs: Song[];
}

export class DatabaseService {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '../data/database.json');
  }

  private readDatabase(): Database {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      throw new Error('Failed to read database');
    }
  }

  private writeDatabase(data: Database): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing database:', error);
      throw new Error('Failed to write database');
    }
  }

  // Rudiment methods
  getAllRudiments(): Rudiment[] {
    const db = this.readDatabase();
    return db.rudiments;
  }

  getRudimentById(id: string): Rudiment | undefined {
    const db = this.readDatabase();
    return db.rudiments.find(rudiment => rudiment.id === id);
  }

  getRudimentsByDifficulty(difficulty: string): Rudiment[] {
    const db = this.readDatabase();
    return db.rudiments.filter(rudiment => rudiment.difficulty === difficulty);
  }

  addRudiment(rudiment: Omit<Rudiment, 'id' | 'createdAt' | 'updatedAt'>): Rudiment {
    const db = this.readDatabase();
    const id = rudiment.name.toLowerCase().replace(/\s+/g, '-');
    const now = new Date().toISOString();
    
    const newRudiment: Rudiment = {
      ...rudiment,
      id,
      createdAt: now,
      updatedAt: now
    };

    db.rudiments.push(newRudiment);
    this.writeDatabase(db);
    return newRudiment;
  }

  updateRudiment(id: string, updates: Partial<Omit<Rudiment, 'id' | 'createdAt'>>): Rudiment | null {
    const db = this.readDatabase();
    const index = db.rudiments.findIndex(rudiment => rudiment.id === id);
    
    if (index === -1) {
      return null;
    }

    db.rudiments[index] = {
      ...db.rudiments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.writeDatabase(db);
    return db.rudiments[index];
  }

  deleteRudiment(id: string): boolean {
    const db = this.readDatabase();
    const index = db.rudiments.findIndex(rudiment => rudiment.id === id);
    
    if (index === -1) {
      return false;
    }

    db.rudiments.splice(index, 1);
    this.writeDatabase(db);
    return true;
  }

  // Song methods
  getAllSongs(): Song[] {
    const db = this.readDatabase();
    return db.songs;
  }

  getSongById(id: string): Song | undefined {
    const db = this.readDatabase();
    return db.songs.find(song => song.id === id);
  }

  getSongsByDifficulty(difficulty: string): Song[] {
    const db = this.readDatabase();
    return db.songs.filter(song => song.difficulty === difficulty);
  }

  addSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Song {
    const db = this.readDatabase();
    const id = song.title.toLowerCase().replace(/\s+/g, '-');
    const now = new Date().toISOString();
    
    const newSong: Song = {
      ...song,
      id,
      createdAt: now,
      updatedAt: now
    };

    db.songs.push(newSong);
    this.writeDatabase(db);
    return newSong;
  }

  updateSong(id: string, updates: Partial<Omit<Song, 'id' | 'createdAt'>>): Song | null {
    const db = this.readDatabase();
    const index = db.songs.findIndex(song => song.id === id);
    
    if (index === -1) {
      return null;
    }

    db.songs[index] = {
      ...db.songs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.writeDatabase(db);
    return db.songs[index];
  }

  deleteSong(id: string): boolean {
    const db = this.readDatabase();
    const index = db.songs.findIndex(song => song.id === id);
    
    if (index === -1) {
      return false;
    }

    db.songs.splice(index, 1);
    this.writeDatabase(db);
    return true;
  }
}
