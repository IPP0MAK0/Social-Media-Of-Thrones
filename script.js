// Initialize with default users
var objPeople = [
    {
        username: "admin",
        password: "1234"
    },
    {
        username: "jon",
        password: "snow"
    }
];

// Login function
function getInfo(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Get all users (both hardcoded and from localStorage)
    let allUsers = getAllUsers();

    // Check credentials
    for (var i = 0; i < allUsers.length; i++) {
        if (username === allUsers[i].username && password === allUsers[i].password) {
            // Store current user in sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(allUsers[i]));
            window.location.href = 'homepage.html';
            return;
        }
    }

    alert("Invalid username or password.");
}

// Registration function
function register(event) {
    event.preventDefault();
    const user = document.getElementById('newUsername').value;
    const pass = document.getElementById('newPassword').value;

    if (user && pass) {
        // Get stored users from localStorage
        let storedUsers = JSON.parse(localStorage.getItem("users")) || [];
        
        // Check if username exists in either hardcoded or stored users
        let allUsers = objPeople.concat(storedUsers);
        let userExists = allUsers.some(person => person.username === user);

        if (userExists) {
            alert("Username already exists.");
            return;
        }

        // Add new user to stored users
        storedUsers.push({
            username: user,
            password: pass
        });

        // Save to localStorage
        localStorage.setItem("users", JSON.stringify(storedUsers));
        
        // Store current user in sessionStorage and redirect
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: user,
            password: pass
        }));
        
        alert("Account Created!");
        window.location.href = "homepage.html";
    } else {
        alert("Please fill out both fields.");
    }
}

// Helper function to get all users
function getAllUsers() {
    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    return objPeople.concat(storedUsers);
}

// Display current user on homepage
function displayCurrentUser() {
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && document.querySelector('.profile-username')) {
        document.querySelector('.profile-username').textContent = currentUser.username;
    }
}

// Like functionality
function setupLikeButtons() {
    document.querySelectorAll('.action-button').forEach(button => {
        button.addEventListener('click', function() {
            const postContainer = this.closest('.post-container');
            const engagementCount = postContainer.querySelector('.engagement-count');
            
            if (this.querySelector('.action-icon').textContent === '👍') {
                const currentLikes = parseInt(engagementCount.textContent.match(/\d+/)[0]) || 0;
                engagementCount.textContent = `👍${currentLikes + 1}`;
            } else if (this.querySelector('.action-icon').textContent === '👎') {
                const currentDislikes = parseInt(engagementCount.textContent.match(/\d+/)[0]) || 0;
                engagementCount.textContent = `👎${currentDislikes + 1}`;
            }
        });
    });
}

// Comment functionality
function setupCommentButtons() {
    document.querySelectorAll('.action-button').forEach(button => {
        if (button.querySelector('.action-icon').textContent === '💬') {
            button.addEventListener('click', function() {
                const postContainer = this.closest('.post-container');
                let commentSection = postContainer.querySelector('.comment-section');
                
                if (!commentSection) {
                    // Create comment section
                    commentSection = document.createElement('div');
                    commentSection.className = 'comment-section';
                    commentSection.innerHTML = `
                        <div class="comment-input">
                            <input type="text" placeholder="Write a comment..." class="comment-text">
                            <button class="post-comment">Post</button>
                        </div>
                        <div class="comments-list"></div>
                    `;
                    
                    // Insert after engagement bar
                    const engagementBar = postContainer.querySelector('.engagement-bar');
                    engagementBar.parentNode.insertBefore(commentSection, engagementBar.nextSibling);
                    
                    // Setup comment posting
                    const postButton = commentSection.querySelector('.post-comment');
                    postButton.addEventListener('click', function() {
                        const commentText = commentSection.querySelector('.comment-text').value;
                        if (commentText.trim()) {
                            const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || { username: "Guest" };
                            const commentsList = commentSection.querySelector('.comments-list');
                            const newComment = document.createElement('div');
                            newComment.className = 'comment';
                            newComment.innerHTML = `
                                <div class="comment-user">${currentUser.username}</div>
                                <div class="comment-content">${commentText}</div>
                            `;
                            commentsList.appendChild(newComment);
                            commentSection.querySelector('.comment-text').value = '';
                            
                            // Update comment count
                            const commentCount = engagementBar.querySelector('div:last-child');
                            const currentCount = parseInt(commentCount.textContent.match(/\d+/)[0]) || 0;
                            commentCount.textContent = `${currentCount + 1} comments`;
                        }
                    });
                } else {
                    // Toggle visibility
                    commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });
}

// Story functionality
function setupStories() {
    const stories = [
        { id: 1, image: 'Images/dragons.jpg', viewed: false },
        { id: 2, image: 'Images/story2.jpg', viewed: false },
        { id: 3, image: 'Images/story3.jpg', viewed: false },
        { id: 4, image: 'Images/story4.jpg', viewed: false },
        { id: 5, image: 'Images/story5.jpg', viewed: false }
    ];

    // Adjust story container to fit the story image
    const storyContainer = document.querySelector('.story-modal-content');
    if (storyContainer) {
        storyContainer.style.display = 'flex';  
        storyContainer.style.justifyContent = 'center';
        storyContainer.style.alignItems = 'center';
        storyContainer.style.maxWidth = '80%';
        storyContainer.style.maxHeight = '70%';
    }

    const storyElements = document.querySelectorAll('.story');
    const storyModal = document.querySelector('.story-modal');
    const storyImage = document.getElementById('storyImage');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const closeBtn = document.querySelector('.close-btn');
    const progressBars = document.querySelectorAll('.progress-fill');
    
    let currentStoryIndex = 0;
    let progressInterval;
    const storyDuration = 5000; // 5 seconds per story

    storyElements.forEach((story, index) => {
        story.addEventListener('click', function() {
            currentStoryIndex = index;
            openStory(currentStoryIndex);
        });
    });

    function openStory(index) {
        if (index < 0 || index >= stories.length) return;
        
        currentStoryIndex = index;
        storyImage.src = stories[index].image;
        storyModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        resetProgressBars();
        startProgress();
    }

    function closeStory() {
        storyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearInterval(progressInterval);
    }

    function showNextStory() {
        clearInterval(progressInterval);
        if (currentStoryIndex < stories.length - 1) {
            currentStoryIndex++;
            openStory(currentStoryIndex);
        } else {
            closeStory();
        }
    }

    function showPrevStory() {
        clearInterval(progressInterval);
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            openStory(currentStoryIndex);
        }
    }

    function startProgress() {
        let startTime = Date.now();
        progressInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = (elapsedTime / storyDuration) * 100;
            
            progressBars[currentStoryIndex].style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                showNextStory();
            }
        }, 50);
    }

    function resetProgressBars() {
        progressBars.forEach(bar => {
            bar.style.width = '0%';
        });
    }

    prevBtn.addEventListener('click', showPrevStory);
    nextBtn.addEventListener('click', showNextStory);
    closeBtn.addEventListener('click', closeStory);

    document.addEventListener('keydown', function(e) {
        if (storyModal.style.display !== 'flex') return;
        
        if (e.key === 'ArrowLeft') {
            showPrevStory();
        } else if (e.key === 'ArrowRight') {
            showNextStory();
        } else if (e.key === 'Escape') {
            closeStory();
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentUser();
    
    if (document.querySelector('.post-container')) {
        setupLikeButtons();
        setupCommentButtons();
    }

    if (document.querySelector('.story')) {
        setupStories();
    }
});
