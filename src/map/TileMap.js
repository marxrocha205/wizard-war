import { Logger } from '../utils/Logger.js';

/**
 * @fileoverview Gerencia e renderiza a arena baseada em um arquivo JSON.
 * @module map/TileMap
 */
export class TileMap {
    constructor() {
        this.mapData = null;
        this.tileSize = 0;
    }

    /**
     * Carrega o JSON do mapa assincronamente.
     * @param {string} path - Caminho para o JSON.
     */
    async load(path) {
        try {
            const response = await fetch(path);
            this.mapData = await response.json();
            this.tileSize = this.mapData.tileSize;
            Logger.info(`Mapa '${this.mapData.name}' carregado com sucesso.`);
        } catch (error) {
            Logger.error(`Falha ao carregar o mapa em ${path}`, error);
        }
    }

    /**
     * Verifica colisão AABB entre um retângulo e os tiles sólidos.
     * Algoritmo de resolução de colisão ampla (Broad-phase).
     * @param {Object} rect - Objeto contendo {x, y, w, h}
     * @returns {Array} Lista de retângulos de blocos colidindo.
     */
    getCollidingTiles(rect) {
        if (!this.mapData) return [];

        let collisions = [];

        const startCol = Math.floor(rect.x / this.tileSize);
        const endCol = Math.floor((rect.x + rect.w) / this.tileSize);
        const startRow = Math.floor(rect.y / this.tileSize);
        const endRow = Math.floor((rect.y + rect.h) / this.tileSize);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (col >= 0 && col < this.mapData.columns && row >= 0 && row < this.mapData.rows) {
                    const tileType = this.mapData.tiles[row * this.mapData.columns + col];
                    
                    // NOVO: Agora captura tanto o Tile 1 (Sólido) quanto o Tile 2 (Plataforma)
                    if (tileType === 1 || tileType === 2) { 
                        collisions.push({
                            x: col * this.tileSize,
                            y: row * this.tileSize,
                            w: this.tileSize,
                            // A plataforma laranja é desenhada mais fina (1/3 do tamanho)
                            h: tileType === 2 ? this.tileSize / 3 : this.tileSize, 
                            type: tileType // <-- Passa o tipo para a engine de física
                        });
                    }
                }
            }
        }
        return collisions;
    }

    draw(ctx) {
        if (!this.mapData) return;

        for (let row = 0; row < this.mapData.rows; row++) {
            for (let col = 0; col < this.mapData.columns; col++) {
                const tile = this.mapData.tiles[row * this.mapData.columns + col];
                const x = col * this.tileSize;
                const y = row * this.tileSize;

                if (tile === 1) {
                    ctx.fillStyle = '#7f8c8d'; // Cor da Parede
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#2c3e50';
                    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                } else if (tile === 2) {
                    ctx.fillStyle = '#e67e22'; // Cor da Plataforma
                    ctx.fillRect(x, y, this.tileSize, this.tileSize / 3);
                }
            }
        }
    }
}