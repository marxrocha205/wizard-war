/**
 * @fileoverview Sistema de logging centralizado.
 * @module utils/Logger
 */

const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// Nível atual de log (pode ser alterado via variável de ambiente em um build system futuramente)
const CURRENT_LOG_LEVEL = LogLevel.DEBUG;

export class Logger {
    /**
     * Registra mensagens de depuração (ex: tracking de variáveis de física).
     * @param {string} message - A mensagem de log.
     * @param {any} [data] - Dados adicionais opcionais.
     */
    static debug(message, data = '') {
        if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`, data);
        }
    }

    /**
     * Registra mensagens de informação geral (ex: inicialização de módulos).
     * @param {string} message 
     */
    static info(message) {
        if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
            console.info(`%c[INFO] ${message}`, 'color: #4CAF50');
        }
    }

    /**
     * Registra avisos (ex: falhas não críticas, queda de FPS).
     * @param {string} message 
     */
    static warn(message) {
        if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`);
        }
    }

    /**
     * Registra erros críticos.
     * @param {string} message 
     * @param {Error} [error] 
     */
    static error(message, error = '') {
        if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, error);
        }
    }
}