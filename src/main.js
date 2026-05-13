import { GameEngine } from './core/GameEngine.js';
import { Logger } from './utils/Logger.js';

/**
 * @fileoverview Ponto de entrada da aplicação.
 */

window.addEventListener('DOMContentLoaded', () => {
    try {
        Logger.info('Iniciando o SkyBattle Arena...');
        const engine = new GameEngine('gameCanvas');
        engine.start();
    } catch (error) {
        Logger.error('Falha fatal ao iniciar o jogo.', error);
    }
});