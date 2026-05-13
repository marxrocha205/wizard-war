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
            div.addEventListener('dragstart', (e) => {
                this.draggedIndex = index;
                this.isDraggingUI = true; // Iniciou o arrasto
                div.classList.add('dragging');
                
                // Evita que o clique se propague como um tiro
                e.stopPropagation();
            });

            div.addEventListener('drop', (e) => {
                e.preventDefault();
                this.onSwap(this.draggedIndex, index);
                this.draggedIndex = null;
                this.isDraggingUI = false; // Finalizou
                this.render();
            });

            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
                this.isDraggingUI = false; // Reset de segurança
            });

            this.container.appendChild(div);
        });
    }
}