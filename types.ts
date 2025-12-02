export enum GameScreen {
  MENU = 'MENU',
  GAME_CIPHER = 'GAME_CIPHER', // Sifre Cozucu (Bilsem)
  GAME_MEMORY = 'GAME_MEMORY', // Hafiza
  GAME_STORY = 'GAME_STORY',   // Hikaye Modu
  REWARDS = 'REWARDS'          // Boyama / Odul
}

export interface GameState {
  stars: number;
  unlockedColoring: boolean;
}