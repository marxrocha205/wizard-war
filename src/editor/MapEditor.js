/**
 * @fileoverview Editor de Mapas Visual com suporte a Zoom e Ferramentas.
 * @module editor/MapEditor
 */

const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');

const mapData = {
    name: "Arena_01",
    tileSize: 40,
    columns: Math.floor(canvas.width / 40), // 80 colunas
    rows: Math.floor(canvas.height / 40),   // 40 linhas
    tiles: [] 
};

mapData.tiles = new Array(mapData.columns * mapData.rows).fill(0);

let currentTileType = 1; 
let isDrawing = false;

// --- SISTEMA DE ZOOM ---
let currentZoom = 1.0;
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.25; // 25%
const MAX_ZOOM = 2.0;  // 200%

const zoomLevelText = document.getElementById('zoom-level');

function applyZoom(newZoom) {
    // Limita o zoom entre o mínimo e o máximo
    currentZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
    zoomLevelText.innerText = `${Math.round(currentZoom * 100)}%`;
    
    // Altera o tamanho visual do canvas no CSS.
    // O navegador se encarrega de criar/remover as barras de rolagem do contêiner automaticamente!
    canvas.style.width = `${canvas.width * currentZoom}px`;
    canvas.style.height = `${canvas.height * currentZoom}px`;
}

document.getElementById('btn-zoom-in').addEventListener('click', () => applyZoom(currentZoom + ZOOM_STEP));
document.getElementById('btn-zoom-out').addEventListener('click', () => applyZoom(currentZoom - ZOOM_STEP));

// Aplica o zoom inicial (opcional: começar em 50% para ver mais do mapa)
applyZoom(0.5); 

// --- Controles da UI (Ferramentas e Exportar) ---
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.tile-btn');
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        currentTileType = parseInt(targetBtn.getAttribute('data-type'));
    });
});

document.getElementById('btn-export').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", mapData.name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// --- Lógica de Pintura com Mapeamento de Escala ---
function getIndex(x, y) {
    const col = Math.floor(x / mapData.tileSize);
    const row = Math.floor(y / mapData.tileSize);
    return row * mapData.columns + col;
}

function paintTile(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    
    // FATOR DE ESCALA: Se o CSS alterou o tamanho visual, precisamos corrigir a coordenada do mouse
    // rect.width é o tamanho visual (CSS), canvas.width é o tamanho interno real (3200)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Coordenada do mouse corrigida para o mundo interno do Canvas
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const index = getIndex(x, y);
    if (index >= 0 && index < mapData.tiles.length) {
        mapData.tiles[index] = currentTileType;
    }
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', paintTile);
window.addEventListener('mouseup', () => isDrawing = false);
// Evita que o mapa fique desenhando se o mouse sair da área do canvas
canvas.addEventListener('mouseleave', () => isDrawing = false); 

// --- Loop de Renderização ---
// O código de renderização continua inalterado porque o Canvas interno não mudou de tamanho!
function draw() {
    ctx.fillStyle = '#2c3e50'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let row = 0; row < mapData.rows; row++) {
        for (let col = 0; col < mapData.columns; col++) {
            const tile = mapData.tiles[row * mapData.columns + col];
            const x = col * mapData.tileSize;
            const y = row * mapData.tileSize;

            if (tile === 1) { 
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(x, y, mapData.tileSize, mapData.tileSize);
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("Sólido", x + mapData.tileSize / 2, y + mapData.tileSize / 2 + 4);
                
            } else if (tile === 2) { 
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(x, y, mapData.tileSize, mapData.tileSize / 3);
                ctx.fillStyle = '#ffffff';
                ctx.font = '9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("Plat.", x + mapData.tileSize / 2, y + 10);
            }

            ctx.strokeStyle = 'rgba(52, 73, 94, 0.5)'; 
            ctx.strokeRect(x, y, mapData.tileSize, mapData.tileSize);
        }
    }
    requestAnimationFrame(draw);
}

draw();