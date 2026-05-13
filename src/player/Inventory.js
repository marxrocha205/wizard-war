export class Inventory {
    constructor(player) {
        this.player = player;
        this.slots = new Array(6).fill(null);
        this.activeIndex = 0;
if (player.spells && player.spells.length > 0) {
            this._setupDefaultSpells();
        } else {
            Logger.warn("Player inicializado sem magias no inventário.");
        }
    }
       
    _setupDefaultSpells() {
        const spells = this.player.spells;
        // Mapeia as magias disponíveis para os slots iniciais
        for (let i = 0; i < Math.min(spells.length, 3); i++) {
            this.slots[i] = { type: 'spell', data: spells[i] };
        }
    }

    /**
     * Troca dois itens de lugar no inventário
     */
    swapSlots(fromIndex, toIndex) {
        const temp = this.slots[fromIndex];
        this.slots[fromIndex] = this.slots[toIndex];
        this.slots[toIndex] = temp;
    }

    /**
     * Executa a ação do slot atual (Atirar ou Usar Item)
     */
    useActiveSlot(input, deltaTime) {
        const slot = this.slots[this.activeIndex];
        if (!slot) return;

        if (slot.type === 'spell') {
            this.player._handleShooting(deltaTime, input, slot.data);
        } else if (slot.type === 'item') {
            this._useItem(slot);
        }
    }

    _useItem(slot) {
        // Lógica para poções de vida/mana (Consome o item após usar)
        if (slot.data.id === 'HealthPotion') {
            this.player.stats.health = Math.min(this.player.stats.health + 50, this.player.stats.maxHealth);
            this.slots[this.activeIndex] = null; // Consome
        }
        // Atualiza a UI após consumo
    }
}