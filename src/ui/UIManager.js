import { Logger } from '../utils/Logger.js';

/**
 * @fileoverview Gerencia a interface HTML/CSS (HUD).
 * @module ui/UIManager
 */
export class UIManager {
    constructor() {
        // Status do Jogador
        this.hudContainer = document.getElementById('player-hud');
        this.healthBar = document.getElementById('health-bar');
        this.manaBar = document.getElementById('mana-bar');

        // Magia Ativa
        this.spellHud = document.getElementById('spell-hud');
        this.spellName = document.getElementById('spell-name');
        this.spellCost = document.getElementById('spell-cost');
        this.spellIcon = document.getElementById('spell-icon');

        this.lastHealth = -1;
        this.lastMana = -1;
        this.lastSpellId = null; // Guarda o ID da última magia para não atualizar o DOM sem necessidade
        
        this.hideTimer = null;
        this.displayDuration = 3000; 

        Logger.info('UIManager inicializado.');
    }

    /**
     * Atualiza a interface com os dados mais recentes do jogo.
     * @param {Object} stats - Status atuais do jogador.
     * @param {Object} activeSpell - Objeto da magia selecionada no momento.
     */
    update(stats, activeSpell) {
        // 1. Atualização do HUD de Vida/Mana
        const healthChanged = stats.health !== this.lastHealth;
        const manaChanged = stats.mana !== this.lastMana;

        if (healthChanged || manaChanged) {
            const healthPct = Math.max(0, (stats.health / stats.maxHealth) * 100);
            const manaPct = Math.max(0, (stats.mana / stats.maxMana) * 100);

            this.healthBar.style.width = `${healthPct}%`;
            this.manaBar.style.width = `${manaPct}%`;

            this.lastHealth = stats.health;
            this.lastMana = stats.mana;

            this._showHud();
        }

        // 2. Atualização do HUD de Magia (Design Responsivo a Dados)
        if (activeSpell && activeSpell.id !== this.lastSpellId) {
            this.spellName.innerText = activeSpell.name;
            this.spellCost.innerText = `Custo: ${activeSpell.manaCost} Mana`;
            
            // Muda a cor do ícone e adiciona um brilho condizente com a magia
            this.spellIcon.style.backgroundColor = activeSpell.color;
            this.spellIcon.style.boxShadow = `0 0 10px ${activeSpell.color}`;
            
            // Bônus: Pinta a borda do HUD inteiro com a cor da magia
            this.spellHud.style.borderColor = activeSpell.color;
            
            // Faz um efeito de "pulo" visual usando CSS Transform ao trocar a arma
            this.spellHud.style.transform = 'scale(1.1)';
            setTimeout(() => this.spellHud.style.transform = 'scale(1)', 100);

            this.lastSpellId = activeSpell.id;
        }
    }

    _showHud() {
        this.hudContainer.classList.remove('hidden');
        if (this.hideTimer) clearTimeout(this.hideTimer);
        
        this.hideTimer = setTimeout(() => {
            this.hudContainer.classList.add('hidden');
        }, this.displayDuration);
    }
}