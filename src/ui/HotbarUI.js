export class HotbarUI {
    constructor(inventory, onSwap) {
        this.container = document.getElementById('hotbar');
        this.inventory = inventory;
        this.onSwap = onSwap;
        this.draggedIndex = null;
        this.isDraggingUI = false;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
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
                div.appendChild(icon);
            }

            // --- Eventos de Drag and Drop ---
            // --- Eventos de Drag and Drop (Nativo HTML5) ---
            div.addEventListener('dragstart', (e) => {
                // Guarda o INDEX de origem diretamente no evento de arrasto
                e.dataTransfer.setData('text/plain', index);
                div.classList.add('dragging');
            });

            div.addEventListener('dragover', (e) => {
                e.preventDefault(); // Permite que a zona aceite o 'drop'
            });
            
            div.addEventListener('drop', (e) => {
                e.preventDefault();
                
                // Recupera o INDEX que foi guardado no início do arrasto
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                
                // Valida se o número é válido e se não estamos a soltar no mesmo sítio
                if (!isNaN(fromIndex) && fromIndex !== toIndex) {
                    this.onSwap(fromIndex, toIndex);
                    this.render(); // Re-desenha a barra com os itens trocados
                }
            });

            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
                // Segurança extra para descolar o clique
                window.dispatchEvent(new Event('mouseup')); 
            });

            this.container.appendChild(div);
        });
    }
}