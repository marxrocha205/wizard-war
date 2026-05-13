/**
 * @fileoverview Classe base para projéteis (magias) guiada por dados.
 * @module combat/Projectile
 */
export class Projectile {
    /**
     * @param {number} x - Posição X inicial
     * @param {number} y - Posição Y inicial
     * @param {number} angle - Ângulo do disparo
     * @param {Object} spellData - Dados da magia oriundos da SpellLibrary
     */
    constructor(x, y, angle, spellData) {
        this.x = x;
        this.y = y;
        
        // Aplica as propriedades baseadas na magia escolhida
        this.vx = Math.cos(angle) * spellData.speed;
        this.vy = Math.sin(angle) * spellData.speed;
        this.size = spellData.size;
        this.color = spellData.color;
        this.baseDamage = spellData.baseDamage; // Carrega o dano consigo
        
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Limpeza de memória (Destrói se sair muito da tela)
        if (this.x < -100 || this.x > 5000 || this.y < -100 || this.y > 5000) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho opcional (Efeito "Glow")
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reseta o shadowBlur para não afetar outros desenhos
    }
}