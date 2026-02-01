// Get all the elements we need
const problemForm = document.getElementById('problemForm');
const problemsList = document.getElementById('problemsList');
const totalProblemsEl = document.getElementById('totalProblems');
const topicsCoveredEl = document.getElementById('topicsCovered');
const companiesCountEl = document.getElementById('companiesCount');
const revisionCountEl = document.getElementById('revisionCount');
const revisionSection = document.getElementById('revisionSection');
const revisionList = document.getElementById('revisionList');

// Array to store all problems
let problems = [];

// Load problems from localStorage when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadProblems();
    updateStats();
    displayProblems();
    displayRevisionProblems();
});

// Handle form submission
problemForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page refresh
    
    // Get form values
    const problemName = document.getElementById('problemName').value;
    const problemLink = document.getElementById('problemLink').value;
    const difficulty = document.getElementById('difficulty').value;
    const topic = document.getElementById('topic').value;
    const company = document.getElementById('company').value;
    const notes = document.getElementById('notes').value;
    const needsRevision = document.getElementById('needsRevision').checked;
    const revisionDate = document.getElementById('revisionDate').value;
    
    // Create problem object
    const problem = {
        id: Date.now(), // Unique ID using timestamp
        name: problemName,
        link: problemLink || null,
        difficulty: difficulty,
        topic: topic,
        company: company || 'General',
        notes: notes || null,
        needsRevision: needsRevision,
        revisionDate: revisionDate || null,
        revised: false,
        date: new Date().toLocaleDateString()
    };
    
    // Add to problems array
    problems.push(problem);
    
    // Save to localStorage
    saveProblems();
    
    // Update the display
    updateStats();
    displayProblems();
    displayRevisionProblems();
    
    // Clear the form
    problemForm.reset();
    
    // Show success message
    showNotification('Problem added successfully! 🎉');
});

// Function to display all problems
function displayProblems() {
    // Clear the list
    problemsList.innerHTML = '';
    
    // Check if there are any problems
    if (problems.length === 0) {
        problemsList.innerHTML = `
            <div class="empty-state">
                <p>No problems added yet. Start tracking your progress! 📝</p>
            </div>
        `;
        return;
    }
    
    // Display each problem (newest first)
    problems.slice().reverse().forEach(problem => {
        const problemItem = document.createElement('div');
        problemItem.className = 'problem-item';
        
        problemItem.innerHTML = `
            <div class="problem-info">
                <h3>${problem.name}</h3>
                <div class="problem-details">
                    <span class="badge ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                    <span class="badge topic">${problem.topic}</span>
                    <span class="badge company">${problem.company}</span>
                    ${problem.needsRevision && !problem.revised ? '<span class="revision-badge">📌 Needs Revision</span>' : ''}
                    ${problem.revised ? '<span class="badge" style="background: #c6f6d5; color: #22543d;">✅ Revised</span>' : ''}
                    <span style="color: #718096; font-size: 0.9rem;">📅 ${problem.date}</span>
                </div>
                
                <div class="problem-details-full" id="details-${problem.id}">
                    ${problem.link ? `
                        <div class="detail-row">
                            <strong>🔗 Link:</strong> 
                            <a href="${problem.link}" target="_blank">${problem.link}</a>
                        </div>
                    ` : ''}
                    
                    ${problem.notes ? `
                        <div class="detail-row">
                            <strong>📝 Notes:</strong>
                            <div class="notes-box">${problem.notes}</div>
                        </div>
                    ` : ''}
                    
                    ${problem.revisionDate ? `
                        <div class="detail-row">
                            <strong>⏰ Revision Date:</strong> ${new Date(problem.revisionDate).toLocaleDateString()}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="problem-actions">
                ${problem.link || problem.notes || problem.revisionDate ? `
                    <button class="view-details-btn" onclick="toggleDetails(${problem.id})">View Details</button>
                ` : ''}
                ${problem.needsRevision && !problem.revised ? `
                    <button class="mark-revised-btn" onclick="markAsRevised(${problem.id})">Mark Revised</button>
                ` : ''}
                <button class="delete-btn" onclick="deleteProblem(${problem.id})">Delete</button>
            </div>
        `;
        
        problemsList.appendChild(problemItem);
    });
}

// Function to toggle problem details
function toggleDetails(id) {
    const detailsEl = document.getElementById(`details-${id}`);
    detailsEl.classList.toggle('show');
    
    // Change button text
    const btn = event.target;
    if (detailsEl.classList.contains('show')) {
        btn.textContent = 'Hide Details';
    } else {
        btn.textContent = 'View Details';
    }
}

// Function to mark problem as revised
function markAsRevised(id) {
    const problem = problems.find(p => p.id === id);
    if (problem) {
        problem.revised = true;
        saveProblems();
        updateStats();
        displayProblems();
        displayRevisionProblems();
        showNotification('Marked as revised! ✅');
    }
}

// Function to display revision problems
function displayRevisionProblems() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get problems that need revision
    const revisionProblems = problems.filter(p => {
        if (!p.needsRevision || p.revised) return false;
        
        if (p.revisionDate) {
            const revDate = new Date(p.revisionDate);
            revDate.setHours(0, 0, 0, 0);
            return revDate <= today;
        }
        
        return true; // Show all non-revised problems without dates
    });
    
    if (revisionProblems.length === 0) {
        revisionSection.style.display = 'none';
        return;
    }
    
    revisionSection.style.display = 'block';
    revisionList.innerHTML = '';
    
    revisionProblems.forEach(problem => {
        const revisionItem = document.createElement('div');
        revisionItem.className = 'revision-item';
        
        revisionItem.innerHTML = `
            <div>
                <h4>${problem.name}</h4>
                <p>Topic: ${problem.topic} • Difficulty: ${problem.difficulty}</p>
            </div>
            <button class="mark-revised-btn" onclick="markAsRevised(${problem.id})">Mark Revised</button>
        `;
        
        revisionList.appendChild(revisionItem);
    });
}

// Function to delete a problem
function deleteProblem(id) {
    // Confirm before deleting
    if (confirm('Are you sure you want to delete this problem?')) {
        // Remove from array
        problems = problems.filter(problem => problem.id !== id);
        
        // Save to localStorage
        saveProblems();
        
        // Update display
        updateStats();
        displayProblems();
        displayRevisionProblems();
        
        showNotification('Problem deleted! 🗑️');
    }
}

// Function to update statistics
function updateStats() {
    // Total problems
    totalProblemsEl.textContent = problems.length;
    
    // Unique topics
    const uniqueTopics = [...new Set(problems.map(p => p.topic))];
    topicsCoveredEl.textContent = uniqueTopics.length;
    
    // Unique companies
    const uniqueCompanies = [...new Set(problems.map(p => p.company))];
    companiesCountEl.textContent = uniqueCompanies.length;
    
    // Revision count
    const needRevision = problems.filter(p => p.needsRevision && !p.revised).length;
    revisionCountEl.textContent = needRevision;
}

// Function to save problems to localStorage
function saveProblems() {
    localStorage.setItem('interviewProblems', JSON.stringify(problems));
}

// Function to load problems from localStorage
function loadProblems() {
    const saved = localStorage.getItem('interviewProblems');
    if (saved) {
        problems = JSON.parse(saved);
    }
}

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}