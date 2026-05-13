/**
 * @fileoverview Câmera 2D que segue um alvo (Jogador).
 * @module core/Camera
 */
export class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x = 0;
        this.y = 0;
        this.width = viewportWidth;
        this.height = viewportHeight;
    }

    /**
     * Atualiza o tamanho da câmera caso a janela mude de tamanho.
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Centraliza a câmera no alvo (geralmente o jogador).
     * @param {Object} target - Objeto que tenha as propriedades x e y.
     */
    follow(target) {
        // Subtrai metade da tela para que o alvo fique exatamente no centro
        this.x = target.x - (this.width / 2);
        this.y = target.y - (this.height / 2);

        // Bônus: Podemos adicionar limites (clamp) aqui no futuro para a câmera
        // não mostrar o "vazio" além das bordas do mapa.
    }
}