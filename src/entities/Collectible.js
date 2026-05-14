import { Logger } from '../utils/Logger.js';

/**
 * @fileoverview Sistema de espólios (Loot) dropados por inimigos.
 * @module entities/Collectible
 */
export class Collectible {
    /**
     * @param {number} x - Posição X (Onde o NPC morreu)
     * @param {number} y - Posição Y 
     * @param {string} type - 'coin', 'health', ou 'mana'
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 15;
        this.active = true;

        // Efeito de "Pulo" (Pop) ao nascer (Física básica)
        this.vx = (Math.random() - 0.5) * 300; // Joga pra esquerda ou direita aleatoriamente
        this.vy = -400; // Pulo inicial para cima
        this.gravity = 1000;

        // Configura a recompensa visual e numérica
        if (type === 'coin') {
            this.color = '#f1c40f'; // Dourado
            this.value = 10;
        } else if (type === 'health') {
            this.color = '#e74c3c'; // Vermelho
            this.value = 25; // Cura 25 de HP
        } else if (type === 'mana') {
            this.color = '#3498db'; // Azul
            this.value = 50; // Restaura 50 de Mana
        }
    }

    /**
     * Aplica gravidade e colisão com o chão (TileMap)
     */
    update(deltaTime, tileMap) {
        this.vy += this.gravity * deltaTime;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Colisão simplificada apenas com o chão (Tile 1)
        if (tileMap && tileMap.mapData) {
            const rect = { x: this.x - this.size/2, y: this.y - this.size/2, w: this.size, h: this.size };
            const collisions = tileMap.getCollidingTiles(rect);
            
            for (let tile of collisions) {
                if (tile.type === 1) { // Bateu no bloco sólido
                    if (this.vy > 0) { // Caindo
                        this.y = tile.y - this.size/2;
                        this.vy = 0;
                        this.vx = 0; // Para de rolar pro lado quando toca o chão
                    }
                }
            }
        }
    }

    /**
     * Aplica o efeito do coletável ao jogador
     * @param {import('../player/Player').Player} player 
     */
    collect(player) {
        if (this.type === 'coin') {
        player.stats.coins = (player.stats.coins || 0) + this.value;
        this.active = false;
        Logger.info(`Moedas coletadas: +${this.value}`);
    } else {
        // Tenta adicionar ao inventário
        const added = player.inventory.addItem(this.type, 1);
        if (added) {
            this.active = false;
            Logger.info(`${this.type} adicionado ao inventário.`);
        }
    }
}

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Desenha como um pequeno losango/quadrado girado
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Borda preta
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}