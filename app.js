document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const gameDisplay = document.querySelector('.game-container');
    const ground = document.querySelector('.ground-moving');
    const countdownOverlay = document.getElementById('countdownOverlay');
    const scoreDisplay = document.getElementById('score'); // Get score display element

    let birdLeft = 220;
    let birdBottom = 100;
    let gravity = 1; // Lower gravity for potentially easier gameplay, adjust as needed
    let isGameOver = false;
    let gap = 430;
    let score = 0; // Score starts at 0
    let gameTimerId;

    // Ensure initial score display is 0
    if (scoreDisplay) {
        scoreDisplay.innerHTML = score;
    } else {
        console.error("Score display element with id 'score' not found!");
    }


    function startCountdown(callback) {
        let count = 3;
        countdownOverlay.style.display = 'flex'; // Show countdown
        countdownOverlay.innerText = `Game starts in ${count}`;

        let countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.innerText = `Game starts in ${count}`;
            } else {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                callback(); // Start the game after countdown
            }
        }, 1000);
    }

    function startGame() {
        // Apply gravity only if the bird is above the ground
        if (birdBottom > 0) {
             birdBottom -= gravity;
        } else {
            // If bird hits the ground level (0 or less), it's game over
            // We add a small buffer check in moveObstacle as well, but this catches direct ground hit
             if (!isGameOver) { // Prevent multiple calls if already game over
                 gameOver();
             }
        }
        bird.style.bottom = birdBottom + 'px';
        bird.style.left = birdLeft + 'px';
    }

    function gameInit() {
        // Reset game state if restarting
        isGameOver = false;
        score = 0;
        if (scoreDisplay) scoreDisplay.innerHTML = score;
        birdBottom = 100; // Reset bird position
        bird.style.bottom = birdBottom + 'px';
        bird.style.left = birdLeft + 'px';
        // Clear existing obstacles if any from a previous game
        document.querySelectorAll('.obstacle, .topObstacle').forEach(el => el.remove());
        ground.classList.add('ground-moving'); // Ensure ground is moving
        ground.classList.remove('ground'); // Remove static ground class if present


        startCountdown(() => {
            if (!gameTimerId) { // Prevent multiple intervals if restarted quickly
                 gameTimerId = setInterval(startGame, 20);
            }
            generateObstacle();
            document.addEventListener('keyup', control);
        });
    }

    function control(e) {
        // Allow jump only if the game is not over
        if (e.keyCode === 32 && !isGameOver) {
            jump();
        }
    }

    function playJumpSound() {
        const jumpSound = document.getElementById('jumpSound');
        if (jumpSound) {
             jumpSound.currentTime = 0;
             jumpSound.play().catch(e => console.log("Jump sound play failed:", e)); // Optional: Catch potential errors
        }
    }

    function jump() {
        // Prevent jumping too high (optional ceiling check)
        if (birdBottom < 500) { // Adjust 500 based on game container height
            birdBottom += 50; // Jump height
        }
        // Ensure bird doesn't jump above the ceiling instantly
        if (birdBottom > 500) {
             birdBottom = 500;
        }
        bird.style.bottom = birdBottom + 'px';
        playJumpSound();
    }

    function generateObstacle() {
         // Stop generating obstacles if game is over
         if (isGameOver) return;

        let obstacleLeft = 500;
        // Adjust random height generation if needed, e.g., ensure minimum ground clearance
        let randomHeight = Math.random() * 100 + 50; // Example: Min 50px height
        let obstacleBottom = randomHeight;

        const obstacle = document.createElement('div');
        const topObstacle = document.createElement('div');

        // Add classes only if game isn't over (redundant check here, but safe)
        // if (!isGameOver) { // This check is actually not needed here due to the return above
            obstacle.classList.add('obstacle');
            topObstacle.classList.add('topObstacle');
        // }

        gameDisplay.appendChild(obstacle);
        gameDisplay.appendChild(topObstacle);
        obstacle.style.left = obstacleLeft + 'px';
        topObstacle.style.left = obstacleLeft + 'px';
        obstacle.style.bottom = obstacleBottom + 'px';
        topObstacle.style.bottom = obstacleBottom + gap + 'px';

        // Pass necessary variables to moveObstacle
        moveObstacle(obstacle, topObstacle, obstacleLeft, obstacleBottom);

        // Schedule next obstacle generation
        setTimeout(generateObstacle, 3000); // Generate next obstacle after 3 seconds
    }


    // ***** MODIFIED FUNCTION *****
    function moveObstacle(obstacle, topObstacle, obstacleLeft, obstacleBottom) {
        let scored = false; // Flag to ensure score increments only once per obstacle pair

        let timerId = setInterval(() => {
            if (isGameOver) {
                clearInterval(timerId);
                return;
            }

            obstacleLeft -= 2;
            obstacle.style.left = obstacleLeft + 'px';
            topObstacle.style.left = obstacleLeft + 'px';

            // Check if obstacle is off-screen
            if (obstacleLeft < -60) { // Use obstacle width (assuming 60px)
                clearInterval(timerId);
                if (obstacle.parentNode === gameDisplay) gameDisplay.removeChild(obstacle);
                if (topObstacle.parentNode === gameDisplay) gameDisplay.removeChild(topObstacle);
            }

            // *** SCORING LOGIC ***
            // Check if the bird has successfully passed the obstacle
            // We check when the *right edge* of the obstacle passes the *left edge* of the bird
            // Assuming obstacle width is 60px. The check happens when obstacleLeft is just less than birdLeft.
            // Since birdLeft is 220, let's check when obstacleLeft reaches a point clearly past the bird.
            // e.g., when obstacleLeft is 220 - 60 = 160 (back edge passes bird's left edge)
            if (!scored && obstacleLeft < birdLeft - 60) { // Check if passed and not already scored
                score++;
                if (scoreDisplay) scoreDisplay.innerHTML = score;
                scored = true; // Mark as scored
                // Optional: Play score sound
                // playScoreSound();
            }


            // *** COLLISION DETECTION ***
             // !! IMPORTANT !!: Verify these pixel values against your actual bird/obstacle images and CSS
             const obstacleWidth = 60; // Verify this width
             const birdWidth = 50;    // Verify this width
             const birdHeight = 35;   // <<<--- UPDATE THIS (Actual bird visual height)
             const bottomObstacleVisualHeight = 153; // <<<--- UPDATE THIS (Actual bottom obstacle visual height)

             const birdCollisionBoxLeft = birdLeft;
             const birdCollisionBoxRight = birdLeft + birdWidth;
             const birdCollisionBoxTop = birdBottom + birdHeight; // Bird's top edge coordinate
             const birdCollisionBoxBottom = birdBottom;

             const obstacleCollisionBoxLeft = obstacleLeft;
             const obstacleCollisionBoxRight = obstacleLeft + obstacleWidth;
             // Calculate the coordinate of the top edge of the *bottom* obstacle's visual
             const bottomObstacleTopEdge = obstacleBottom + bottomObstacleVisualHeight;
             // Calculate the coordinate of the bottom edge of the *top* obstacle's visual
             const topObstacleBottomEdge = obstacleBottom + gap; // Assuming the top obstacle image extends upwards from this point

             console.log("--- Collision Check Values ---");
             console.log("Bird: L=", birdCollisionBoxLeft, "R=", birdCollisionBoxRight, "T=", birdCollisionBoxTop, "B=", birdCollisionBoxBottom);
             console.log("Bottom Obstacle: Top=", bottomObstacleTopEdge);
             console.log("Top Obstacle: Bottom=", topObstacleBottomEdge);
             console.log("Obstacle: L=", obstacleCollisionBoxLeft, "R=", obstacleCollisionBoxRight);
             console.log("------------------------------");
            // --- Collision Check ---
            // 1. Check if bird is horizontally overlapping with the obstacle space
            if (obstacleLeft > 200 && obstacleLeft < 280 && birdLeft === 220) { 
                let collided = false;
            
                // ✅ Bird collides with bottom pipe
                if (birdBottom < bottomObstacleTopEdge) {
                    console.log(`Collision: Bird bottom (${birdBottom.toFixed(1)}) < Bottom Obstacle Top Edge (${bottomObstacleTopEdge.toFixed(1)})`);
                    collided = true;
                }
                // ✅ Bird collides with top pipe
                else if (birdCollisionBoxTop > topObstacleBottomEdge -10) {
                    console.log(`Collision: Bird top (${birdCollisionBoxTop.toFixed(1)}) > Top Obstacle Bottom Edge (${topObstacleBottomEdge.toFixed(1)})`);
                    collided = true;
                }       

            // Check collision with ground (added safety check)
            // If either vertical collision happened:
            if (collided) {
                // Log details right before calling gameOver
                console.log(`--- Collision Details ---`);
                console.log(`  Bird Rect: L=${birdCollisionBoxLeft}, R=${birdCollisionBoxRight}, B=${birdBottom.toFixed(1)}, T=${birdCollisionBoxTop.toFixed(1)}`);
                console.log(`  Obstacle Rect: L=${obstacleCollisionBoxLeft}, R=${obstacleCollisionBoxRight}`);
                console.log(`  Obstacle Vert: Bottom Pipe Top=${bottomObstacleTopEdge.toFixed(1)}, Top Pipe Bottom=${topObstacleBottomEdge.toFixed(1)}`);
                console.log(`  (Obstacle Base: ${obstacleBottom.toFixed(1)}, Gap: ${gap})`);
                console.log(`-------------------------`);

                gameOver();
                clearInterval(timerId); // Stop this obstacle's movement
             }

            }
            // --- Ground Collision Check (separate) ---
            // Check collision with ground only if game isn't already over
            if (birdBottom <= 0 && !isGameOver) {
                console.log("Collision with ground detected! Bird Bottom:", birdBottom.toFixed(1));
               gameOver();
               clearInterval(timerId); // Stop this obstacle's movement
           }

        }, 20);
    }


    function showGameOverPopup() {
        const overlay = document.getElementById('gameOverOverlay');
        const finalScoreElement = document.getElementById('finalScore'); // Assuming you have an element to show score in popup
        if (finalScoreElement) {
            finalScoreElement.innerText = score; // Display final score
        }
        if(overlay) {
             overlay.style.display = 'flex'; // Show the popup
        }
    }

    function gameOver() {
        // Prevent multiple executions
        if (isGameOver) return;

        console.log("Game Over!");
        clearInterval(gameTimerId); // Stop the main game loop (gravity)
        gameTimerId = null; // Clear the timer ID
        isGameOver = true;
        document.removeEventListener('keyup', control); // Stop listening for jumps
        ground.classList.remove('ground-moving'); // Stop the ground animation
        ground.classList.add('ground'); // Optional: Add static ground class if needed

        // Optional: Add a small delay before showing popup to let user see the collision
        setTimeout(showGameOverPopup, 500); // Show popup after 0.5 seconds

        // Stop all obstacle movements (important!)
        // We handle this inside moveObstacle now by checking isGameOver flag
    }

    // Initial call to start the game process
    gameInit();

    //Optional: Add a restart button listener if you have one in your game over popup
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            const overlay = document.getElementById('gameOverOverlay');
            if (overlay) overlay.style.display = 'none'; // Hide popup
            gameInit(); // Restart the game initialization
        });
    }

});