import { Logger } from '../utils/Logger.js';
import { InputHandler } from './InputHandler.js';
import { Player } from '../player/Player.js';
import { Projectile } from '../combat/Projectile.js';

import { UIManager } from '../ui/UIManager.js';
import { DamageTextManager } from '../ui/DamageTextManager.js';
import { NPC } from '../entities/NPC.js';
import { TileMap } from '../map/TileMap.js';
import { Camera } from './Camera.js';
import { Collectible } from '../entities/Collectible.js';
import { HotbarUI } from '../ui/HotbarUI.js';
/**
 * @fileoverview Motor principal do jogo, responsável pelo Game Loop e gerenciamento do Canvas.
 * @module core/GameEngine
 */
export class GameEngine {
    /**
     * Inicializa a Engine.
     * @param {string} canvasId - O ID do elemento canvas no HTML.
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error("Canvas element is required");
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.isRunning = false;
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.tileMap = new TileMap();
        // Inicializa o mapa exportado (certifique-se que baixou e colocou nesta pasta)
        this.tileMap.load('src/assets/maps/Arena_01.json');
        this._resizeCanvas();
        this.npc = new NPC(600, 300);
        this.collectibles = []; // NOVO: Lista de itens no chão
        this.respawnTimer = 0;
        window.addEventListener('resize', () => this._resizeCanvas());

        this.input = new InputHandler(this.canvas);
        
        // Instanciando UIs
        this.uiManager = new UIManager();
        this.damageTextManager = new DamageTextManager();

        this.player = new Player(600, 200);
        this.projectiles = [];
        
        this.hotbarUI = new HotbarUI(this.player.inventory, (from, to) => {
            this.player.inventory.swapSlots(from, to);
        });

        this.player.onShoot = (x, y, angle, spellData) => {
            this.projectiles.push(new Projectile(x, y, angle, spellData));
        };

        Logger.info('GameEngine inicializada com sucesso.');
    }

    /**
     * Ajusta o canvas para ocupar a tela toda (responsividade).
     * @private
     */
    _resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.camera) {
            this.camera.resize(this.canvas.width, this.canvas.height);
        }
        Logger.debug(`Canvas redimensionado: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Inicia o Game Loop.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        Logger.info('Game Loop iniciado.');
        this._loop(this.lastTime);
    }

    /**
     * Para o Game Loop.
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        Logger.info('Game Loop parado.');
    }

    /**
     * O loop principal executado a cada frame.
     * @param {number} currentTime - Tempo atual em milissegundos passado pelo requestAnimationFrame.
     * @private
     */
    _loop(currentTime) {
        if (!this.isRunning) return;

        // Calcula o deltaTime em segundos
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // PREVENÇÃO DO EFEITO TÚNEL (TUNNELING)
        // Se a aba ficou inativa e o deltaTime acumulou muito (mais de 100ms), 
        // limitamos o valor. Assim, quando você voltar para a aba, a física não explode.
        if (deltaTime > 0.1) {
            deltaTime = 0.1; 
        }

        this.update(deltaTime);
        this.draw();

        this.animationFrameId = requestAnimationFrame((time) => this._loop(time));
    }

    /**
     * Atualiza a lógica do jogo (física, inputs, colisões).
     * Deve ser sobrescrito ou delegar para gerenciadores de estado.
     * @param {number} deltaTime - Tempo desde o último frame.
     */
    update(deltaTime) {
        // 1. Atualiza a física do jogador e a câmera
        this.player.update(deltaTime, this.input, this.tileMap, this.camera);
        this.camera.follow(this.player);
        
        // 2. Atualiza UI com status E a magia equipada
        const activeSpell = this.player.spells[this.player.currentSpellIndex];
        this.uiManager.update(this.player.stats, activeSpell);
        
        // CORREÇÃO AQUI: Atualiza o cursor do inventário de forma otimizada
        this.hotbarUI.update(); 
        
        this.damageTextManager.update(deltaTime);

        // =====================================
        // 3. IA DO INIMIGO E RESPAWN
        // =====================================
        if (this.npc.active) {
            this.npc.update(deltaTime, this.tileMap);
        } else {
            // Se morreu, conta o tempo para nascer de novo (3 segundos)
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.npc.respawn();
            }
        }

        // =====================================
        // 4. COLISÃO: JOGADOR PEGANDO COLETÁVEIS
        // =====================================
        this.collectibles.forEach(item => {
            item.update(deltaTime, this.tileMap);
            
            // Distância Euclidiana simples para pegar o item
            const dx = this.player.x - item.x;
            const dy = this.player.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se o jogador chegou perto do item
            if (distance < 30 && item.active) {
                item.collect(this.player);
            }
        });

        // =====================================
        // 5. LÓGICA DE PROJÉTEIS (MAPA E ENTIDADES)
        // =====================================
        this.projectiles.forEach(p => {
            p.update(deltaTime);

            if (p.active) {
                // COLISÃO COM O MAPA (PAREDES)
                const pRect = { x: p.x - p.size, y: p.y - p.size, w: p.size * 2, h: p.size * 2 };
                const mapCollisions = this.tileMap.getCollidingTiles(pRect);
                if (mapCollisions.some(tile => tile.type === 1)) {
                    p.active = false; 
                }

                // DANO NO INIMIGO E SISTEMA DE MORTE
                if (p.active && this.npc.active) { 
                    const hitPart = this.npc.checkHit(p);
                    if (hitPart) {
                        p.active = false; 
                        
                        let multiplier = 1.0;
                        if (hitPart === 'feet') multiplier = 0.5; 
                        if (hitPart === 'body') multiplier = 1.0; 
                        if (hitPart === 'head') multiplier = 2.0; 

                        let finalDamage = Math.floor(p.baseDamage * multiplier);
                        this.npc.health -= finalDamage;
                        this.damageTextManager.add(p.x, p.y, finalDamage, hitPart);

                        // Lógica de Morte
                        if (this.npc.health <= 0) {
                            // Gera os espólios e joga no mapa
                            const droppedLoot = this.npc.die();
                            this.collectibles.push(...droppedLoot);
                            
                            // Inicia o timer de 3 segundos para ele voltar a viver
                            this.respawnTimer = 3.0; 
                        }
                    }
                }
            }
        });

        // =====================================
        // 6. LIMPEZA (GARBAGE COLLECTION)
        // =====================================
        this.projectiles = this.projectiles.filter(p => p.active);
        this.collectibles = this.collectibles.filter(c => c.active);
    }
    /**
     * Renderiza os gráficos no canvas.
     */
    draw() {
        this.ctx.fillStyle = '#1e272e'; // Um fundo mais escuro (céu)
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. SALVA O ESTADO E APLICA A CÂMERA (Desloca o mundo todo)
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // ==========================================
        // TUDO AQUI DENTRO ESTÁ NO "WORLD SPACE" (MUNDO)
        // ==========================================
        
        this.tileMap.draw(this.ctx);
        
        // Desenha os coletáveis antes do player
        this.collectibles.forEach(c => c.draw(this.ctx)); 
        
        this.npc.draw(this.ctx);
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.player.draw(this.ctx);
        this.damageTextManager.draw(this.ctx); // Textos flutuantes ficam presos ao mundo

        // RESTAURA O ESTADO (Remove a câmera)
        this.ctx.restore();

        // TODO: Iterar sobre as entidades e chamar seus métodos de renderização
    }
}