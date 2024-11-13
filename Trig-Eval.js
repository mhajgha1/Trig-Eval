let score = 0;
let level = 1;
let isPlaying = false;
let currentExpression = '';
let currentAnswer = 0;
let expressionElement = document.getElementById('expression');
let moveSpeed = 20;
let currentSpeed = 1;
let baseSpeed = 1;

const specialAngles = {
    'π/6': Math.PI/6,
    'π/4': Math.PI/4,
    'π/3': Math.PI/3,
    'π/2': Math.PI/2,
    '2π/3': 2*Math.PI/3,
    '3π/4': 3*Math.PI/4,
    '5π/6': 5*Math.PI/6,
    'π': Math.PI,
    '7π/6': 7*Math.PI/6,
    '5π/4': 5*Math.PI/4,
    '4π/3': 4*Math.PI/3,
    '3π/2': 3*Math.PI/2
};

const functionValues = {
    sin: {
        'π/6': '1/2',
        'π/4': '√2/2',
        'π/3': '√3/2',
        'π/2': '1/1',
        '2π/3': '√3/2',
        '3π/4': '√2/2',
        '5π/6': '1/2',
        'π': '0/1',
        '7π/6': '-1/2',
        '5π/4': '-√2/2',
        '4π/3': '-√3/2',
        '3π/2': '-1/1'
    },
    cos: {
        'π/6': '√3/2',
        'π/4': '√2/2',
        'π/3': '1/2',
        'π/2': '0/1',
        '2π/3': '-1/2',
        '3π/4': '-√2/2',
        '5π/6': '-√3/2',
        'π': '-1/1',
        '7π/6': '-√3/2',
        '5π/4': '-√2/2',
        '4π/3': '-1/2',
        '3π/2': '0/1'
    },
    tan: {
        'π/6': '1/√3',
        'π/4': '1/1',
        'π/3': '√3/1',
        '2π/3': '-√3/1',
        '3π/4': '-1/1',
        '5π/6': '-1/√3',
        'π': '0/1',
        '7π/6': '1/√3',
        '4π/3': '√3/1',
        '5π/4': '1/1'
    },
    cot: {
        'π/6': '√3/1',
        'π/4': '1/1',
        'π/3': '1/√3',
        '2π/3': '-1/√3',
        '3π/4': '-1/1',
        '5π/6': '-√3/1',
        'π/2': '0/1',
        '7π/6': '√3/1',
        '4π/3': '1/√3',
        '5π/4': '1/1'
    }
};

document.getElementById('function-select').addEventListener('change', updateInstructions);

function updateInstructions() {
    const selectedFunction = document.getElementById('function-select').value;
    const values = functionValues[selectedFunction];
    let html = `<strong>${selectedFunction} Values:</strong><br>`;
    
    for (let angle in values) {
        html += `${selectedFunction}(${angle}) = ${values[angle]}<br>`;
    }
    
    document.getElementById('value-reference').innerHTML = html;
}

document.addEventListener('keydown', function(event) {
    if (!isPlaying) return;

    const currentLeft = parseFloat(expressionElement.style.left) || 0;
    switch(event.key) {
        case 'ArrowLeft':
            if (currentLeft > 0) {
                expressionElement.style.left = (currentLeft - moveSpeed) + 'px';
            }
            break;
        case 'ArrowRight':
            if (currentLeft < (600 - expressionElement.offsetWidth)) {
                expressionElement.style.left = (currentLeft + moveSpeed) + 'px';
            }
            break;
        case 'ArrowDown':
            currentSpeed = baseSpeed * 2;
            break;
        case 'ArrowUp':
            currentSpeed = baseSpeed * 0.5;
            break;
    }
    event.preventDefault();
});

document.addEventListener('keyup', function(event) {
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        currentSpeed = baseSpeed;
    }
});

function generateExpression(level) {
    const selectedFunction = document.getElementById('function-select').value;
    const angles = Object.keys(functionValues[selectedFunction]);
    const angleText = angles[Math.floor(Math.random() * angles.length)];
    
    return {
        text: `${selectedFunction}(${angleText})`,
        answer: functionValues[selectedFunction][angleText]
    };
}

function generateAnswerOptions(correct) {
    const selectedFunction = document.getElementById('function-select').value;
    let options = [correct];
    const values = Object.values(functionValues[selectedFunction]);
    
    while (options.length < 3) {
        let wrong = values[Math.floor(Math.random() * values.length)];
        if (!options.includes(wrong)) {
            options.push(wrong);
        }
    }
    return shuffleArray(options);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    score = 0;
    level = 1;
    isPlaying = true;
    updateScore();
    updateInstructions();
    setupRound();
}

function setupRound() {
    if (!isPlaying) return;

    baseSpeed = Math.min(3, 1 + level * 0.2);
    currentSpeed = baseSpeed;

    let expression = generateExpression(level);
    currentExpression = expression.text;
    currentAnswer = expression.answer;

    let answers = generateAnswerOptions(currentAnswer);
    document.getElementById('box1').textContent = answers[0];
    document.getElementById('box2').textContent = answers[1];
    document.getElementById('box3').textContent = answers[2];

    const boxWidth = 150;
    const spacing = 75;
    const totalWidth = 3 * boxWidth + 2 * spacing;
    const startX = (600 - totalWidth) / 2;

    document.querySelectorAll('.answer-box').forEach((box, index) => {
        box.style.left = (startX + index * (boxWidth + spacing)) + 'px';
    });

    expressionElement.textContent = currentExpression;
    expressionElement.style.left = Math.random() * (500 - expressionElement.offsetWidth) + 'px';
    expressionElement.style.top = '0px';

    dropExpression();
}

function dropExpression() {
    let top = parseFloat(expressionElement.style.top) || 0;
    if (top >= 340) {
        checkAnswer();
        return;
    }
    
    expressionElement.style.top = (top + currentSpeed) + 'px';
    if (isPlaying) {
        requestAnimationFrame(dropExpression);
    }
}

function checkAnswer() {
    let expressionRect = expressionElement.getBoundingClientRect();
    let expressionCenter = expressionRect.left + expressionRect.width / 2;

    let boxes = document.querySelectorAll('.answer-box');
    for (let box of boxes) {
        let boxRect = box.getBoundingClientRect();
        if (expressionCenter >= boxRect.left && expressionCenter <= boxRect.right) {
            if (box.textContent === currentAnswer.toString()) {
                score += 10;
                level = Math.floor(score / 30) + 1;
                box.classList.add('correct');
            } else {
                score = Math.max(0, score - 5);
                box.classList.add('incorrect');
            }
            updateScore();
            break;
        }
    }
    
    setTimeout(() => {
        document.querySelectorAll('.answer-box').forEach(box => {
            box.classList.remove('correct', 'incorrect');
        });
        setupRound();
    }, 1000);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score} (Level ${level})`;
}

function toggleInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

// Initialize instructions with sine values
updateInstructions();