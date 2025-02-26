let points = [];
let targetPoints = [];
let numPoints = 5;
let speed = 0.03;
let lyrics = [
  "Fitter happier", "More productive", "Comfortable",
  "Not drinking too much", "Regular exercise at the gym\n(3 days a week)",
  "Getting on better with\nyour associate employee contemporaries",
  "At ease", "Eating well\n(no more microwave dinners and saturated fats)",
  "A patient, better driver", "A safer car\n(baby smiling in back seat)",
  "Sleeping well (no bad dreams)", "No paranoia",
  "Careful to all animals\n(never washing spiders down the plughole)",
  "Keep in contact with old friends\n(enjoy a drink now and then)",
  "Will frequently check credit\nat (moral) bank (hole in the wall)",
  "Favours for favours", "Fond but not in love", "Charity standing orders",
  "On Sundays ring road supermarket",
  "No killing moths or\nputting boiling water on the ants",
  "Car wash (also on Sundays)",
  "No longer afraid of the dark or\nmidday shadows",
  "Nothing so ridiculously\nteenage and desperate",
  "Nothing so childish", "At a better pace",
  "Slower and more calculated",
  "No chance of escape",
  "Now self-employed",
  "Concerned (but powerless)",
  "An empowered and\ninformed member of society\n(pragmatism not idealism)",
  "Will not cry in public",
  "Less chance of illness",
  "Tyres that grip in the wet\n(shot of baby strapped in back seat)",
  "A good memory",
  "Still cries at a good film",
  "Still kisses with saliva",
  "No longer empty and frantic",
  "Like a cat\ntied to a stick",
  "That's driven into\nFrozen winter shit\n(the ability to laugh at weakness)",
  "Calm",
  "Fitter,\nhealthier and\nmore productive",
];
let cellTexts = [];

// 在setup函數之前添加
let menuBtn, overlay, newLyricInput, submitBtn;
let infoBtn, infoOverlay, closeInfoBtn;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 獲取DOM元素
  menuBtn = document.getElementById('menuBtn');
  overlay = document.getElementById('overlay');
  newLyricInput = document.getElementById('newLyric');
  submitBtn = document.getElementById('submitBtn');
  
  // 獲取新增的 DOM 元素
  infoBtn = document.getElementById('infoBtn');
  infoOverlay = document.getElementById('infoOverlay');
  closeInfoBtn = document.getElementById('closeInfoBtn');
  
  
  // 創建文字元素並添加到menuBtn中
  const menuText = document.createElement('span');
  menuText.textContent = menuBtn.textContent;
  menuBtn.textContent = '';  // 清空原始文字
  menuBtn.appendChild(menuText);
  
  // 修改 menuBtn 的點擊事件
  menuBtn.addEventListener('click', () => {
    if (overlay.classList.contains('hidden')) {
      overlay.classList.remove('hidden');
      menuText.style.transform = 'rotate(45deg)';  // 只旋轉文字
    } else {
      overlay.classList.add('hidden');
      menuText.style.transform = 'rotate(0deg)';   // 恢復文字角度
      newLyricInput.value = '';
    }
  });
  
  submitBtn.addEventListener('click', () => {
    const newLyric = newLyricInput.value.trim();
    if (newLyric) {
      lyrics.push(newLyric);
      
      // 自動新增一個點
      if (points.length < 20) {  // 保持點數限制檢查
        // 在畫布範圍內隨機生成新點
        points.push(createVector(
          random(width * 0.1, width * 0.9),
          random(height * 0.1, height * 0.9)
        ));
        targetPoints.push(createVector(
          random(width * 0.1, width * 0.9),
          random(height * 0.1, height * 0.9)
        ));
        
        // 直接使用新增的歌詞
        cellTexts.push(newLyric);
      }
      
      newLyricInput.value = '';
      overlay.classList.add('hidden');
    }
  });
  
  // 添加 info 按鈕點擊事件
  infoBtn.addEventListener('click', () => {
    infoOverlay.classList.remove('hidden');
  });
  
  closeInfoBtn.addEventListener('click', () => {
    infoOverlay.classList.add('hidden');
  });
  
  // 初始化點
  for (let i = 0; i < numPoints; i++) {
    // 在畫布範圍內隨機生成點
    let p = createVector(
      random(width * 0.1, width * 0.9),
      random(height * 0.1, height * 0.9)
    );
    points.push(p);
    
    // 為每個點創建一個目標位置
    let target = createVector(
      random(width * 0.1, width * 0.9),
      random(height * 0.1, height * 0.9)
    );
    targetPoints.push(target);
  }
  
  // After creating points, assign unique random text to each cell
  let availableLyrics = [...lyrics]; // Create a copy of lyrics array
  for (let i = 0; i < numPoints; i++) {
    let randomIndex = floor(random(availableLyrics.length));
    cellTexts[i] = availableLyrics[randomIndex];
    availableLyrics.splice(randomIndex, 1); // Remove the used lyric
  }
  
  drawInfoBtnPattern();
}

function draw() {
  background(220);
  
  // 更新點的位置
  updatePoints();
  
  // 繪製 Voronoi 圖案
  drawVoronoiPattern();
}

function updatePoints() {
  for (let i = 0; i < points.length; i++) {
    // 當點接近目標時生成新目標
    let d = p5.Vector.dist(points[i], targetPoints[i]);
    if (d < 1) {
      targetPoints[i] = createVector(
        random(width * 0.1, width * 0.9),
        random(height * 0.1, height * 0.9)
      );
    }
    
    // 點向目標移動
    let dir = p5.Vector.sub(targetPoints[i], points[i]);
    dir.mult(speed);
    points[i].add(dir);
  }
}

function drawVoronoiPattern() {
  // Create an array to store the centers of each cell
  let cellCenters = Array(points.length).fill().map(() => createVector(0, 0));
  let cellCounts = Array(points.length).fill(0);
  
  // 為每個像素找到最近的點
  for (let x = 0; x < width; x += 2) {
    for (let y = 0; y < height; y += 2) {
      let closest = 0;
      let secondClosest = 1;
      let minDist = Infinity;
      let secondMinDist = Infinity;
      
      // 找到最近和第二近的點
      for (let i = 0; i < points.length; i++) {
        let d = dist(x, y, points[i].x, points[i].y);
        if (d < minDist) {
          secondMinDist = minDist;
          secondClosest = closest;
          minDist = d;
          closest = i;
        } else if (d < secondMinDist) {
          secondMinDist = d;
          secondClosest = i;
        }
      }
      
      // Accumulate points for calculating cell centers
      cellCenters[closest].add(createVector(x, y));
      cellCounts[closest]++;
      
      // Draw the boundary
      let diff = abs(minDist - secondMinDist);
      if (diff < 2) {
        stroke(0);
        point(x, y);
      }
    }
  }
  
  // Calculate and draw the text in cell centers
  textAlign(CENTER, CENTER);
  textSize(12);
  for (let i = 0; i < points.length; i++) {
    if (cellCounts[i] > 0) {
      cellCenters[i].div(cellCounts[i]);
      fill(0);
      text(cellTexts[i], cellCenters[i].x, cellCenters[i].y);
    }
  }
}

// 點擊滑鼠添加新點
function mousePressed() {
  if (points.length < 20) {  // 限制最大點數
    points.push(createVector(mouseX, mouseY));
    targetPoints.push(createVector(
      random(width * 0.1, width * 0.9),
      random(height * 0.1, width * 0.9)
    ));
    
    // Check if there are any newly added lyrics (from the end of the array)
    let usedLyrics = new Set(cellTexts);
    // Start checking from the end of lyrics array to prioritize newly added lyrics
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (!usedLyrics.has(lyrics[i])) {
        cellTexts.push(lyrics[i]);
        return;
      }
    }
    // If all lyrics are used, use a random one
    cellTexts.push(random(lyrics));
  }
}

function drawInfoBtnPattern() {
  let infoCanvas = createGraphics(160, 160);
  infoCanvas.background(0, 0, 0, 0);  // 透明背景
  
  // 使用與主畫面相同的點狀效果
  for (let x = 0; x < 160; x += 2) {
    for (let y = 0; y < 160; y += 2) {
      if (random() > 0) {  // 控制點的密度
        infoCanvas.stroke(0, 0, 0, 128);
        infoCanvas.point(x, y);
      }
    }
  }
  
  // 將 canvas 轉換為 base64 圖片
  let dataUrl = infoCanvas.elt.toDataURL();
  
  // 設置為 infoBtn 的背景
  infoBtn.style.backgroundImage = `url(${dataUrl})`;
  infoBtn.style.backgroundColor = 'transparent';
}