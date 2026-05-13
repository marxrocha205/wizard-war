/**
 * @fileoverview Biblioteca de Magias (Data-Driven Design).
 * @module combat/SpellLibrary
 */

export const SpellLibrary = {
    // 1. Míssil Arcano: Tiro padrão, rápido e barato.
    ArcaneMissile: {
        id: 'ArcaneMissile',
        name: 'Míssil Arcano',
        manaCost: 5,
        cooldown: 0.2,    // 200ms entre tiros
        speed: 500,
        size: 4,
        color: '#00ffff', // Ciano
        baseDamage: 15
    },
    // 2. Bola de Fogo: Lenta, cara, mas causa um dano massivo.
    Fireball: {
        id: 'Fireball',
        name: 'Bola de Fogo',
        manaCost: 30,
        cooldown: 1.0,    // 1 segundo de recarga
        speed: 250,       // Lenta
        size: 12,         // Grande
        color: '#e74c3c', // Vermelho
        baseDamage: 50
    },
    // 3. Rajada de Vento: Metralhadora de baixo dano e muito rápida.
    WindGust: {
        id: 'WindGust',
        name: 'Rajada de Vento',
        manaCost: 2,
        cooldown: 0.08,   // Muito rápida
        speed: 700,
        size: 3,
        color: '#2ecc71', // Verde
        baseDamage: 5
    }
};