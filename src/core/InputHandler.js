import { Logger } from '../utils/Logger.js';

/**
 * @fileoverview Gerenciador de inputs (Teclado e Mouse).
 * @module core/InputHandler
 */
export class InputHandler {
    constructor(canvas) {
        /** @type {Object<string, boolean>} Mapeia o código da tecla para seu estado (pressionada ou não) */
        this.keys = {};
        
        /** @type {{x: number, y: number}} Posição do mouse relativa ao canvas */
        this.mouse = { x: 0, y: 0 };
        
        /** @type {boolean} Estado do clique esquerdo */
        this.isMouseDown = false;
        this.isOverUI = false;
        this.canvas = canvas;

        this._initializeListeners();
        Logger.info('InputHandler inicializado.');
    }

    /**
     * Configura os event listeners do navegador.
     * @private
     */
    _initializeListeners() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse (Movimento)
        window.addEventListener('mousemove', (e) => {
            // Garante que a posição do mouse seja relativa ao canvas, mesmo se a janela mudar
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Mouse (Clique)
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.isMouseDown = true; // Clique esquerdo
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.isMouseDown = false;
        });
        // Reset de segurança caso o Drag and Drop do HTML5 "roube" o clique
        window.addEventListener('dragend', () => {
            this.isMouseDown = false;
        });
    }

    /**
     * Verifica se uma tecla específica está pressionada.
     * @param {string} keyCode - O código da tecla (ex: 'KeyW', 'Space')
     * @returns {boolean}
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
}