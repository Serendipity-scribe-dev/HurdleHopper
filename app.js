document.addEventListener('DOMContentLoaded' , () => {
    const bird = document.querySelector('.bird')
    const gameDisplay = document.querySelector('.game-container')
    const ground = document.querySelector('.ground-moving')
    

    let birdLeft = 220//positioning of the bird
    let birdBottom = 100 //positioning of the bird
    let gravity = 1
    let isGameOver = false
    let gap = 430
    let score = 0

    // countdownOverlay.id = 'countdownOverlay';
    // countdownOverlay.style.position = 'absolute';
    // countdownOverlay.style.top = '50%';
    // countdownOverlay.style.left = '50%';
    // countdownOverlay.style.transform = 'translate(-50%, -50%)';
    // countdownOverlay.style.fontSize = '50px';
    // countdownOverlay.style.fontWeight = 'bold';
    // countdownOverlay.style.color = 'white';
    // countdownOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
    // countdownOverlay.style.padding = '20px';
    // countdownOverlay.style.borderRadius = '10px';
    // countdownOverlay.style.zIndex = '1000';
    // gameDisplay.appendChild(countdownOverlay);

    // function startCountdown(callback) {
    //     let count = 3;
    //     countdownOverlay.innerText = `Game starts in ${count}`;
        
    //     let countdownInterval = setInterval(() => {
    //         count--;
    //         if (count > 0) {
    //             countdownOverlay.innerText = count;
    //         } else {
    //             clearInterval(countdownInterval);
    //             countdownOverlay.style.display = 'none';
    //             callback(); // Start the game after countdown
    //         }
    //     }, 1000);
    // }     


    function startGame() {
        birdBottom -= gravity //we want the bird to move down with gravity, it is dropping as soon as we start the game
        bird.style.bottom = birdBottom + 'px'//spacing of bird from bottom
        bird.style.left = birdLeft + 'px'//spacing from left
        
    }
    let gameTimerId = setInterval(startGame, 20)//dropping visual in every 20 milisec
    
    function gameInit() {
        startCountdown(() => {
            gameTimerId = setInterval(startGame, 20);
            generateObstacle();
            document.addEventListener('keyup', control);
        });
    }

    //jump using spacebar
    function control(e) 
    {
        if (e.keyCode === 32) {
            jump()
        }
    }

    function playJumpSound() {
    const jumpSound = document.getElementById('jumpSound');
    jumpSound.currentTime = 0; // Rewind the sound to the beginning (in case it's already playing)
    jumpSound.play();
}

    function jump() {
        if (birdBottom < 480)/*to keep inside the container*/ birdBottom += 50//each time we invoke the jump funtion we are adding 50px from the bottom
        bird.style.bottom = birdBottom + 'px'//then this is the changed birdBottom to display
        playJumpSound();
        console.log(birdBottom)  
    }
    document.addEventListener('keyup', control)//whenever key is released, control funtion is called


    function generateObstacle() 

    {
        let obstacleLeft = 500 //positioning of the obstacle
        let randomHeight = Math.random() * 150
        let obstacleBottom = randomHeight//obstacle generating at random height

        const obstacle = document.createElement('div')//creating obstacle and passing through div 
        const topObstacle = document.createElement('div')
        if (!isGameOver) {
            obstacle.classList.add('obstacle')//adding obstacle to div
            topObstacle.classList.add('topObstacle')
        }
        gameDisplay.appendChild(obstacle)//putting obstacle to gamedisplay
        gameDisplay.appendChild(topObstacle)//
        obstacle.style.left = obstacleLeft + 'px'
        topObstacle.style.left = obstacleLeft + 'px'
        obstacle.style.bottom = obstacleBottom + 'px'
        topObstacle.style.bottom = obstacleBottom + gap + 'px'


        function moveObstacle() {
            obstacleLeft -=2
            obstacle.style.left = obstacleLeft + 'px' //moving from right to left
            topObstacle.style.left = obstacleLeft + 'px'

            //making obstacles disappear

            if (obstacleLeft === -60)/* if obstacle reaches edge it's getting disappeared*/ {
                clearInterval(timerId)
                gameDisplay.removeChild(obstacle)//removing the obstacle element
                gameDisplay.removeChild(topObstacle)

        
            }

            //stop generating new obstacles
            if (
                obstacleLeft > 200 && obstacleLeft < 280 && birdLeft === 220 &&
                (birdBottom < obstacleBottom + 153 || birdBottom > obstacleBottom + gap -200)||
                birdBottom === 0 
                )//collision
            {
                gameOver()
                clearInterval(timerId)//stopping obstacle when there is a collision
            }
        }
        let timerId = setInterval(moveObstacle, 20)//obstacle moving
        if (!isGameOver) setTimeout(generateObstacle, 3000)//generating new obstacle
        {
            score++
            console.log(score)
            document.getElementById('score').innerHTML=score;
        }

    }
    generateObstacle()

    function showGameOverPopup() 
    {
    const overlay = document.getElementById('gameOverOverlay');
    overlay.style.display = 'flex';
  }

    function gameOver() {
        clearInterval(gameTimerId)//clear the startGame function
        isGameOver = true
        
        document.removeEventListener('keyup', control)//stopping key from working
        ground.classList.add('ground')
        ground.classList.remove('ground-moving')
        showGameOverPopup()

    }
    
    gameInit();

})