import { Logger } from '../utils/Logger.js';
import { SpellLibrary } from '../combat/SpellLibrary.js';
import { Inventory } from './Inventory.js';
/**
 * @fileoverview Entidade principal do Jogador com Física Dinâmica.
 * @module player/Player
 */
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // Vetores de velocidade
        this.vx = 0;
        this.vy = 0;

        // Configurações Físicas
        this.gravity = 1200;       // Força puxando para baixo (pixels/s²)
        this.jetpackForce = -2000; // Força do voo puxando para cima (negativo no Canvas)
        this.moveAcceleration = 1500; // Quão rápido ele ganha velocidade lateral
        this.maxSpeedX = 300;      // Velocidade máxima horizontal
        this.friction = 0.85;      // Atrito no eixo X (suaviza a parada)
        this.maxFallSpeed = 600;   // Limite de velocidade de queda
        

        this.stats = {
            name: "Mago Voador",
            health: 100,
            mana: 100,
            maxMana: 100
        };

        // Configurações de Mana e Voo
        this.manaCostPerSecond = 40;  // Gasto de mana por segundo voando
        this.manaRegenPerSecond = 20; // Recuperação de mana por segundo
        this.isFlying = false;        // Estado atual de voo

        this.facingRight = true;
        this.aimAngle = 0;
        this.fireCooldown = 0.2;
        this.currentFireTimer = 0;
        this.onShoot = null; 
        this.spells = [SpellLibrary.ArcaneMissile, SpellLibrary.Fireball, SpellLibrary.WindGust];
        this.currentSpellIndex = 0;
        
        // Substitua os antigos currentFireTimer e fireCooldown por este:
        this.currentFireTimer = 0;
        Logger.info(`Player instanciado com motor de física 2D.`);
        this.inventory = new Inventory(this);
        Logger.info(`Inventário do Player inicializado.`);
    }
/**
     * Atualiza a lógica do jogador.
     * @param {number} deltaTime 
     * @param {import('../core/InputHandler').InputHandler} input 
     * @param {import('../map/TileMap').TileMap} tileMap - Mapa para checagem de colisão
     */
    update(deltaTime, input, tileMap, camera) { 
        this._handleInput(deltaTime, input);
        this._applyPhysics(deltaTime, tileMap, input); 
        this._handleAim(input, camera);
        
        // Troca de slot pelos números 1 a 6
        this._updateInventorySelection(input);
        
        // O inventário gerencia TUDO (Atirar ou Usar Poção)
        this.inventory.useActiveSlot(input, deltaTime);
    }
    _updateInventorySelection(input) {
        if (input.isKeyPressed('Digit1')) this.inventory.activeIndex = 0;
        if (input.isKeyPressed('Digit2')) this.inventory.activeIndex = 1;
        if (input.isKeyPressed('Digit3')) this.inventory.activeIndex = 2;
        if (input.isKeyPressed('Digit4')) this.inventory.activeIndex = 3;
        if (input.isKeyPressed('Digit5')) this.inventory.activeIndex = 4;
        if (input.isKeyPressed('Digit6')) this.inventory.activeIndex = 5;
    }
    /**
     * Captura inputs de movimento e voo, aplicando as forças iniciais.
     * @private
     */
    _handleInput(deltaTime, input) {
        // Movimento Horizontal (Eixo X)
        if (input.isKeyPressed('KeyA')) {
            this.vx -= this.moveAcceleration * deltaTime;
        } else if (input.isKeyPressed('KeyD')) {
            this.vx += this.moveAcceleration * deltaTime;
        } else {
            // Aplica atrito quando nenhuma tecla é pressionada para parada suave
            this.vx *= this.friction; 
        }

        // Limita a velocidade máxima horizontal
        if (this.vx > this.maxSpeedX) this.vx = this.maxSpeedX;
        if (this.vx < -this.maxSpeedX) this.vx = -this.maxSpeedX;

        // Sistema de Voo (Jetpack)
        this.isFlying = false;
        // O Input 'Space' aciona o voo, SE houver mana
        if (input.isKeyPressed('Space') && this.stats.mana > 0) {
            this.isFlying = true;
            this.vy += this.jetpackForce * deltaTime;
            this.stats.mana -= this.manaCostPerSecond * deltaTime;
            
            // Garante que a mana não fique negativa
            if (this.stats.mana < 0) this.stats.mana = 0; 
        } else {
            // Se não está voando, regenera a mana gradualmente
            if (this.stats.mana < this.stats.maxMana) {
                this.stats.mana += this.manaRegenPerSecond * deltaTime;
                if (this.stats.mana > this.stats.maxMana) this.stats.mana = this.stats.maxMana;
            }
        }
    }

    /**
     * Aplica gravidade, atualiza posições e resolve colisões com o chão.
     * @private
     */
    _applyPhysics(deltaTime, tileMap, input) {
        if (!tileMap || !tileMap.mapData) return;

        const hitBoxW = 30;
        const hitBoxH = 70; 
        const offsetY = -40; 
        const skin = 2; 

        // Salva a posição Y do frame anterior. Fundamental para a plataforma One-Way!
        const oldY = this.y; 

        // ==========================================
        // 1. APLICA MOVIMENTO X
        // ==========================================
        this.x += this.vx * deltaTime;
        
        let rectX = { 
            x: this.x - hitBoxW/2, 
            y: this.y + offsetY + skin, 
            w: hitBoxW, 
            h: hitBoxH - (skin * 2) 
        };

        let collisionsX = tileMap.getCollidingTiles(rectX);
        for (let tile of collisionsX) {
            // PLATAFORMA: Ignore colisões laterais. Você pode andar através delas.
            if (tile.type === 2) continue; 

            // SÓLIDO: Bloqueia a passagem
            if (this.vx > 0) { 
                this.x = tile.x - hitBoxW/2;
                this.vx = 0;
            } else if (this.vx < 0) { 
                this.x = (tile.x + tile.w) + hitBoxW/2;
                this.vx = 0;
            }
        }

        // ==========================================
        // 2. APLICA GRAVIDADE E MOVIMENTO Y
        // ==========================================
        this.vy += this.gravity * deltaTime;
        if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
        this.y += this.vy * deltaTime;

        let rectY = { 
            x: this.x - hitBoxW/2 + skin, 
            y: this.y + offsetY, 
            w: hitBoxW - (skin * 2), 
            h: hitBoxH 
        };

        let collisionsY = tileMap.getCollidingTiles(rectY);
        for (let tile of collisionsY) {
            
            // --- LÓGICA DA PLATAFORMA ATRAVESSÁVEL ---
            if (tile.type === 2) {
                // Se apertar S (Descer), se estiver subindo (vy < 0) = ignora.
                if (input.isKeyPressed('KeyS') || this.vy < 0) continue;

                // Só pisa na plataforma se estiver caindo (vy > 0)
                if (this.vy > 0) {
                    // Posição da sola do pé no frame anterior
                    const oldBottom = oldY + offsetY + hitBoxH;
                    
                    // Se no frame anterior a sola do pé estava acima ou exatamente no topo da plataforma:
                    // (Usamos +0.5 para precisão de ponto flutuante em jogos rápidos)
                    if (oldBottom <= tile.y + 0.5) {
                        this.y = tile.y - hitBoxH - offsetY; 
                        this.vy = 0; 
                    }
                }
            } 
            // --- LÓGICA DO BLOCO SÓLIDO ---
            else if (tile.type === 1) {
                if (this.vy > 0) { // Caindo
                    this.y = tile.y - hitBoxH - offsetY; 
                    this.vy = 0; 
                } else if (this.vy < 0) { // Bateu a cabeça
                    this.y = tile.y + tile.h - offsetY;
                    this.vy = 0; 
                }
            }
        }
    }

    _handleAim(input, camera) {
        const mouseWorldX = input.mouse.x + camera.x;
        const mouseWorldY = input.mouse.y + camera.y;

        const dx = mouseWorldX - this.x;
        const dy = mouseWorldY - this.y;
        
        this.aimAngle = Math.atan2(dy, dx);
        this.facingRight = dx >= 0;
    }

 
    /**
     * Gerencia o disparo de magias baseado no cooldown e mana.
     */
    _handleShooting(deltaTime, input, activeSpell) {
        if (this.currentFireTimer > 0) {
            this.currentFireTimer -= deltaTime;
        }

        if (!activeSpell) return;

        // Verifica se o mouse está em cima da Hotbar para não atirar
        const isOverUI = document.querySelector('.hotbar-container:hover');

        // CORREÇÃO: Colocamos o !isOverUI dentro do IF principal
        if (input.isMouseDown && !isOverUI && this.currentFireTimer <= 0 && this.stats.mana >= activeSpell.manaCost) {
            
            this.stats.mana -= activeSpell.manaCost;

            const wandEndX = this.x + Math.cos(this.aimAngle) * 30;
            const wandEndY = this.y + Math.sin(this.aimAngle) * 30;

            if (typeof this.onShoot === 'function') {
                this.onShoot(wandEndX, wandEndY, this.aimAngle, activeSpell);
            }
            
            this.currentFireTimer = activeSpell.cooldown; 
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (!this.facingRight) ctx.scale(-1, 1);

        // Corpo
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-15, -20, 30, 40); 

        // Cabeça
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-10, -40, 20, 20);

        // Pés
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-10, 20, 20, 10);

        // Efeito visual do Jetpack (Fogo nos pés se estiver voando)
        if (this.isFlying) {
            ctx.fillStyle = '#e67e22'; // Laranja
            // Desenha pequenas chamas embaixo dos pés
            ctx.fillRect(-10, 30, 8, 15 + Math.random() * 10); 
            ctx.fillRect(2, 30, 8, 15 + Math.random() * 10);
        }

        ctx.restore();

        // Varinha
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aimAngle);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(10, -2, 25, 4);
        ctx.restore();

        // --- HUD Provisório Acima do Jogador ---
        
        // Nome
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.stats.name, this.x, this.y - 65);

        // Barra de Vida
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 20, this.y - 55, 40, 4);

        // Barra de Mana (Azul)
        ctx.fillStyle = '#2980b9'; // Fundo escuro da mana
        ctx.fillRect(this.x - 20, this.y - 48, 40, 4);
        ctx.fillStyle = '#3498db'; // Mana atual
        const manaPercentage = this.stats.mana / this.stats.maxMana;
        ctx.fillRect(this.x - 20, this.y - 48, 40 * manaPercentage, 4);
    }
}