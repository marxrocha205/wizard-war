import { Logger } from '../utils/Logger.js';
import { Collectible } from './Collectible.js';

/**
 * @fileoverview Entidade NPC com IA de Patrulha, Física e Drops.
 * @module entities/NPC
 */
export class NPC {
    constructor(x, y) {
        // Posição de origem para o respawn
        this.spawnX = x;
        this.spawnY = y;
        
        this.gravity = 1200;
        this.respawn();
        Logger.info(`NPC IA Patrulha inicializado.`);
    }

    /**
     * Reseta os atributos do NPC.
     */
    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 100; // Velocidade de patrulha (pixels por segundo)
        this.vy = 0;
        this.health = 200; // Vida total do inimigo
        this.active = true;
    }

    /**
     * IA e Física do NPC.
     */
    update(deltaTime, tileMap) {
        if (!this.active || !tileMap || !tileMap.mapData) return;

        // Dimensões exatas do NPC:
        // Cabeça(-30 a -10) + Corpo(-10 a +30) + Pés(+30 a +40) = 70 pixels de altura
        const hitBoxW = 30;
        const hitBoxH = 70;
        const offsetY = -30; // Topo da cabeça em relação ao this.y
        const skin = 2;      // Margem de tolerância anti-enrosco

        // ==========================================
        // 1. FÍSICA X (PATRULHA E PAREDES)
        // ==========================================
        this.x += this.vx * deltaTime;
        
        // Retângulo com skin (mais curto em cima e embaixo para não raspar no chão)
        let rectX = { 
            x: this.x - hitBoxW/2, 
            y: this.y + offsetY + skin, 
            w: hitBoxW, 
            h: hitBoxH - (skin * 2) 
        };

        let collisionsX = tileMap.getCollidingTiles(rectX);
        for (let tile of collisionsX) {
            if (tile.type === 1) { // Bateu na Parede Sólida
                if (this.vx > 0) { // Indo para direita
                    this.x = tile.x - hitBoxW/2;
                    this.vx = -100; // Vira pra esquerda
                } else if (this.vx < 0) { // Indo para esquerda
                    this.x = tile.x + tile.w + hitBoxW/2;
                    this.vx = 100; // Vira pra direita
                }
            }
        }

        // ==========================================
        // 2. FÍSICA Y (GRAVIDADE E CHÃO)
        // ==========================================
        this.vy += this.gravity * deltaTime;
        // Aplica uma velocidade limite (Terminal Velocity) para ele não varar o chão caindo rápido demais
        if (this.vy > 600) this.vy = 600; 
        this.y += this.vy * deltaTime;

        // Retângulo com skin (mais fino nas laterais para não raspar na parede caindo)
        let rectY = { 
            x: this.x - hitBoxW/2 + skin, 
            y: this.y + offsetY, 
            w: hitBoxW - (skin * 2), 
            h: hitBoxH 
        };

        let collisionsY = tileMap.getCollidingTiles(rectY);
        for (let tile of collisionsY) {
            if (tile.type === 1) { // Bateu no chão
                if (this.vy > 0) {
                    // Posiciona os pés perfeitamente na borda do bloco (mesma matemática do player)
                    this.y = tile.y - hitBoxH - offsetY;
                    this.vy = 0;
                }
            }
        }
    }

    // Mantemos as hitboxes antigas inalteradas
    getHitboxes() {
        return {
            head: { x: this.x - 10, y: this.y - 30, w: 20, h: 20 },
            body: { x: this.x - 15, y: this.y - 10, w: 30, h: 40 },
            feet: { x: this.x - 10, y: this.y + 30, w: 20, h: 10 }
        };
    }

    _pointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
    }

    checkHit(projectile) {
        const boxes = this.getHitboxes();
        if (this._pointInRect(projectile.x, projectile.y, boxes.head)) return 'head';
        if (this._pointInRect(projectile.x, projectile.y, boxes.body)) return 'body';
        if (this._pointInRect(projectile.x, projectile.y, boxes.feet)) return 'feet';
        return null;
    }

    /**
     * Gera os itens de loot baseados em probabilidade.
     * @returns {Array<Collectible>}
     */
    die() {
        this.active = false;
        let loots = [];
        
        // 100% de chance de dropar 1 moeda
        loots.push(new Collectible(this.x, this.y - 20, 'coin'));
        
        // 50% de chance de dropar Vida
        if (Math.random() > 0.5) loots.push(new Collectible(this.x, this.y - 20, 'health'));
        
        // 50% de chance de dropar Mana
        if (Math.random() > 0.5) loots.push(new Collectible(this.x, this.y - 20, 'mana'));

        return loots;
    }

    draw(ctx) {
        if (!this.active) return; // Não desenha se estiver morto

        ctx.save();
        ctx.translate(this.x, this.y);

        // Vira o sprite dependendo de onde ele está andando
        if (this.vx < 0) ctx.scale(-1, 1);

        // Corpo
        ctx.fillStyle = '#7f8c8d'; 
        ctx.fillRect(-15, -10, 30, 40); 
        // Cabeça
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(-10, -30, 20, 20);
        // Olho malvado (Para parecer IA)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(0, -25, 6, 6); 
        // Pés
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-10, 30, 20, 10);
        
        ctx.restore();

        // Barra de Vida do Inimigo flutuante
        const healthPct = Math.max(0, this.health / 200);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 20, this.y - 45, 40, 4);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(this.x - 20, this.y - 45, 40 * healthPct, 4);
    }
}