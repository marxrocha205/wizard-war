export class HotbarUI {
    constructor(inventory, onSwap) {
        this.container = document.getElementById('hotbar');
        this.inventory = inventory;
        this.onSwap = onSwap;
        
        this.draggedIndex = null;
        this.lastActiveIndex = inventory.activeIndex; // NOVO: Guarda o estado anterior
        
        this.init();
    }

    init() {
        this.render();
    }

    // NOVO MÉTODO: O Game Loop chama este método a 60FPS, mas ele só 
    // mexe na tela se você realmente trocou de slot (Performance absurda!)
    update() {
        if (this.inventory.isDirty) {
        this.render();
        this.inventory.isDirty = false;
        }
    }

    render() {
        // Limpa a tela inteira da hotbar
        this.container.innerHTML = '';
        
        this.inventory.slots.forEach((slot, index) => {
            const div = document.createElement('div');
            div.className = `slot ${index === this.inventory.activeIndex ? 'active' : ''}`;
            div.draggable = !!slot;
            div.innerHTML = `<span class="slot-number">${index + 1}</span>`;

            if (slot) {
                const icon = document.createElement('div');
                icon.className = 'slot-icon';
                icon.style.backgroundColor = slot.data.color || '#fff';
                icon.style.borderRadius = slot.type === 'spell' ? '50%' : '4px';
                // Adicionamos isso via JS para garantir que o ícone não atrapalhe o clique
                icon.style.pointerEvents = 'none'; 
                div.appendChild(icon);
            }

            // ===============================================
            // NOVO EVENTO: CLIQUE PARA SELECIONAR A ARMA
            // ===============================================
            div.addEventListener('mousedown', (e) => {
                // Atualiza os dados no inventário do Player
                this.inventory.activeIndex = index;
                // Força a UI a atualizar para colocar a borda amarela
                this.update(); 
            });

            // ===============================================
            // EVENTOS DE DRAG AND DROP (NATIVO HTML5)
            // ===============================================
            div.addEventListener('dragstart', (e) => {
                // Guarda o INDEX como texto (Exigência do HTML5)
                e.dataTransfer.setData('text/plain', index.toString());
                div.classList.add('dragging');
            });

            div.addEventListener('dragover', (e) => {
                e.preventDefault(); // Obrigatório para o Drop funcionar
            });
            
            div.addEventListener('drop', (e) => {
                e.preventDefault();
                
                // Pega o número guardado
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                
                // Valida a troca
                if (!isNaN(fromIndex) && fromIndex !== toIndex) {
                    this.onSwap(fromIndex, toIndex);
                    // Como a ordem dos itens mudou, mandamos renderizar do zero
                    this.render(); 
                }
            });

            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
                // Segurança extra (Solta o gatilho da arma)
                window.dispatchEvent(new Event('mouseup')); 
            });

            this.container.appendChild(div);
        });
    }
}