export class Inventory {
    constructor(player) {
        this.player = player;
        this.slots = new Array(6).fill(null);
        this.activeIndex = 0;
        
        // PADRÃO ARCH: Flag que avisa a UI que precisa ser redesenhada
        this.isDirty = true; 

        // Magias Iniciais (não possuem "amount")
        this.slots[0] = { type: 'spell', data: player.spells[0] }; 
        this.slots[1] = { type: 'spell', data: player.spells[1] }; 
        this.slots[2] = { type: 'spell', data: player.spells[2] }; 
    }

    swapSlots(fromIndex, toIndex) {
        const temp = this.slots[fromIndex];
        this.slots[fromIndex] = this.slots[toIndex];
        this.slots[toIndex] = temp;
        this.isDirty = true; // Avisa a tela para atualizar
    }

    useActiveSlot(input, deltaTime) {
        const slot = this.slots[this.activeIndex];
        if (!slot) return;

        if (slot.type === 'spell') {
            this.player._handleShooting(deltaTime, input, slot.data);
        } else if (slot.type === 'item') {
            // Se clicar com o mouse usando o item
            if (input.isMouseDown) {
                this._useItem(slot);
                // Reseta o clique para não usar o pacote inteiro em 1 frame
                input.isMouseDown = false; 
            }
        }
    }
    addItem(type, amount = 1) {
    const itemId = type === 'health' ? 'HealthPotion' : 'ManaPotion';
    const itemName = type === 'health' ? 'Poção de Vida' : 'Poção de Mana';
    const itemColor = type === 'health' ? '#e74c3c' : '#3498db';

    // 1. Tenta encontrar um slot que já tenha esse item para empilhar (Stack)
    const existingSlot = this.slots.find(s => s && s.type === 'item' && s.data.id === itemId);
    
    if (existingSlot) {
        existingSlot.amount += amount;
    } else {
        // 2. Se não tem, procura o primeiro slot vazio
        const emptyIndex = this.slots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            this.slots[emptyIndex] = {
                type: 'item',
                amount: amount,
                data: {
                    id: itemId,
                    name: itemName,
                    color: itemColor,
                    value: type === 'health' ? 25 : 50 // Valor de cura/mana
                }
            };
        } else {
            Logger.warn("Inventário cheio!");
            return false;
        }
    }

    this.isDirty = true; // Avisa o HotbarUI para redesenhar
    return true;
}
    _useItem(slot) {
        // Aplica o efeito
        if (slot.data.id === 'HealthPotion') {
            this.player.stats.health = Math.min(this.player.stats.health + slot.data.value, this.player.stats.maxHealth);
        } else if (slot.data.id === 'ManaPotion') {
            this.player.stats.mana = Math.min(this.player.stats.mana + slot.data.value, this.player.stats.maxMana);
        }
        
        // Reduz a pilha (Stack)
        slot.amount -= 1;
        
        // Se acabou, limpa o slot
        if (slot.amount <= 0) {
            this.slots[this.activeIndex] = null;
        }
        
        this.isDirty = true; // Avisa a tela para atualizar
    }
}