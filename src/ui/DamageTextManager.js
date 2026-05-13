/**
 * @fileoverview Gerencia textos flutuantes de dano.
 * @module ui/DamageTextManager
 */
export class DamageTextManager {
    constructor() {
        this.texts = [];
    }

    /**
     * Adiciona um novo número de dano na tela.
     * @param {number} x 
     * @param {number} y 
     * @param {number} damage - Valor do dano
     * @param {string} type - 'head', 'body', ou 'feet' para cor
     */
    add(x, y, damage, type) {
        let finalY = y;
        
        // Lógica Anti-Sobreposição: Empilha os textos se estiverem na mesma área
        this.texts.forEach(t => {
            // Se a distância X for menor que 30 e a distância Y for menor que 20, empurra para cima
            if (Math.abs(t.x - x) < 30 && Math.abs(t.y - finalY) < 20) {
                finalY -= 20; 
            }
        });

        // Define as cores com base na parte do corpo atingida
        let color = '#ffffff'; // Branco (menor dano / pés)
        if (type === 'body') color = '#f1c40f'; // Amarelo (dano médio / corpo)
        if (type === 'head') color = '#e74c3c'; // Vermelho (dano crítico / cabeça)

        this.texts.push({
            x: x,
            y: finalY,
            text: `-${damage}`,
            color: color,
            life: 1.0, // Duração de 1 segundo
            vy: -30 // Velocidade com que flutua para cima (pixels/segundo)
        });
    }

    update(deltaTime) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            let t = this.texts[i];
            t.life -= deltaTime;
            t.y += t.vy * deltaTime; // Flutua para cima

            if (t.life <= 0) {
                this.texts.splice(i, 1); // Remove da memória
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.textAlign = 'center';
        // Fonte em negrito com estilo agressivo
        ctx.font = 'bold 20px "Impact", Arial, sans-serif'; 
        
        this.texts.forEach(t => {
            // Adiciona um efeito de fade-out (opacidade baseada na vida restante)
            ctx.globalAlpha = Math.max(0, t.life); 
            
            // Desenha borda preta (stroke) para dar contraste
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(t.text, t.x, t.y);

            // Desenha o preenchimento (fill) com a cor correspondente
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
        });
        
        ctx.restore();
    }
}