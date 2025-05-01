// Get references to DOM elements
const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let image = null;
const margin = 40;

// Toggle advanced settings visibility
document.getElementById('advToggle').addEventListener('change', function () {
  document.getElementById('advSettings').style.display = this.checked ? 'block' : 'none';
});

// Handle image upload
upload.addEventListener('change', function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      image = img;
      canvas.width = img.width + margin;
      canvas.height = img.height + margin;
      ctx.drawImage(img, margin, margin);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Function to parse cell notation (e.g., '2C') into coordinates
function parseCell(cell) {
  const match = cell.match(/^(\d+)([A-Z])$/);
  if (!match) return [null, null];
  const x = parseInt(match[1], 10) - 1;
  const y = match[2].charCodeAt(0) - 65;
  return [x, y];
}

// Draw grid on canvas
document.getElementById('draw').addEventListener('click', () => {
  if (!image) return;

  const vSquares = parseInt(document.getElementById('vSquares').value);
  const color = document.getElementById('lineColor').value;
  const advMode = document.getElementById('advToggle').checked;

  const imgW = image.width;
  const imgH = image.height;
  const squareSize = imgW / vSquares;
  const hSquares = Math.ceil(imgH / squareSize);

  canvas.width = imgW + margin;
  canvas.height = imgH + margin;

  // Draw original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, margin, margin);

  // Advanced inner grid first
  if (advMode) {
    const startCell = document.getElementById('startCell').value.trim().toUpperCase();
    const endCell = document.getElementById('endCell').value.trim().toUpperCase();
    const innerSquares = parseInt(document.getElementById('innerSquares').value);
    const innerColor = document.getElementById('innerColor').value;

    const [sx, sy] = parseCell(startCell);
    const [ex, ey] = parseCell(endCell);

    if (sx == null || sy == null || ex == null || ey == null || innerSquares < 1) {
      alert('Invalid advanced inputs');
      return;
    }

    const xStart = margin + Math.min(sx, ex) * squareSize;
    const xEnd = margin + (Math.max(sx, ex) + 1) * squareSize;
    const yStart = margin + Math.min(sy, ey) * squareSize;
    const yEnd = margin + (Math.max(sy, ey) + 1) * squareSize;
    const totalSquaresX = innerSquares * (ex - sx + 1);
    const totalSquaresY = innerSquares * (ey - sy + 1);
    const innerSquareSize = squareSize / innerSquares;

    ctx.strokeStyle = innerColor;

    // Draw vertical inner lines
    for (let i = 0; i <= totalSquaresX; i++) {
      const x = xStart + i * innerSquareSize;
      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x, yEnd);
      ctx.stroke();
    }

    // Draw horizontal inner lines
    for (let i = 0; i <= totalSquaresY; i++) {
      const y = yStart + i * innerSquareSize;
      ctx.beginPath();
      ctx.moveTo(xStart, y);
      ctx.lineTo(xEnd, y);
      ctx.stroke();
    }
  }

  // Outer grid second — drawn on top
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.font = "14px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw vertical lines and top labels
  for (let i = 0; i <= vSquares; i++) {
    const x = margin + i * squareSize;
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin + imgH);
    ctx.stroke();
    if (i < vSquares) ctx.fillText(i + 1, x + squareSize / 2, margin / 2);
  }

  // Draw horizontal lines and left labels
  for (let i = 0; i <= hSquares; i++) {
    const y = margin + i * squareSize;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin + imgW, y);
    ctx.stroke();
    if (i < hSquares) {
      const label = String.fromCharCode(65 + i);
      ctx.fillText(label, margin / 2, y + squareSize / 2);
    }
  }
});

// Download the canvas as an image
document.getElementById('download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'grid_image.png';
  link.href = canvas.toDataURL();
  link.click();
});