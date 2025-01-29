class GoalManager {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.form = document.getElementById('goalForm');
        this.goalsContainer = document.querySelector('.goals-container');
        this.editMode = false;
        this.currentEditId = null;
  
        this.init();
    }
  
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.renderGoals();
    }
  
    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.form);
        
        const goal = {
            id: this.editMode ? this.currentEditId : crypto.randomUUID(),
            title: formData.get('goalTitle'),
            description: formData.get('goalDescription'),
            category: formData.get('goalCategory'),
            deadline: formData.get('goalDeadline') || null,
            target: parseInt(formData.get('goalTarget')) || null,
            progress: this.editMode ? 
                this.goals.find(g => g.id === this.currentEditId).progress : 0,
            createdAt: new Date().toISOString()
        };
  
        if (this.editMode) {
            this.updateGoal(goal);
        } else {
            this.addGoal(goal);
        }
  
        this.form.reset();
        this.editMode = false;
        this.currentEditId = null;
        document.getElementById('cancelEdit').style.display = 'none';
    }
  
    addGoal(goal) {
        this.goals.push(goal);
        this.saveGoals();
        this.renderGoals();
    }
  
    updateGoal(updatedGoal) {
        this.goals = this.goals.map(goal => 
            goal.id === updatedGoal.id ? updatedGoal : goal
        );
        this.saveGoals();
        this.renderGoals();
    }
  
    deleteGoal(id) {
        this.goals = this.goals.filter(goal => goal.id !== id);
        this.saveGoals();
        this.renderGoals();
    }
  
    updateProgress(id, newProgress) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.progress = newProgress;
            this.saveGoals();
            this.renderGoals();
        }
    }
  
    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
  
    renderGoals() {
        this.goalsContainer.innerHTML = this.goals
            .map(goal => `
                <div class="goal-card" data-id="${goal.id}">
                    <div class="goal-header">
                        <h3>${goal.title}</h3>
                        <span class="goal-category ${goal.category}">${goal.category}</span>
                    </div>
                    ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" 
                                 style="width: ${this.calculateProgress(goal)}%"></div>
                        </div>
                        <span class="progress-text">
                            ${this.calculateProgress(goal)}% Complete
                            ${goal.target ? `(${goal.progress}/${goal.target})` : ''}
                        </span>
                    </div>
                    <div class="goal-meta">
                        <div class="deadline">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}</span>
                        </div>
                        <div class="actions">
                            <button class="btn-edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
  
        // Add event listeners to new elements
        this.addEventListeners();
    }
  
    calculateProgress(goal) {
        if (!goal.target) return 0;
        return Math.min(Math.round((goal.progress / goal.target) * 100), 100);
    }
  
    addEventListeners() {
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const goalId = button.closest('.goal-card').dataset.id;
                this.deleteGoal(goalId);
            });
        });
  
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const goalId = button.closest('.goal-card').dataset.id;
                this.setEditMode(goalId);
            });
        });
    }
  
    setEditMode(id) {
        const goal = this.goals.find(g => g.id === id);
        this.editMode = true;
        this.currentEditId = id;
  
        // Populate form with goal data
        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalDescription').value = goal.description || '';
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalDeadline').value = goal.deadline ? goal.deadline.split('T')[0] : '';
        document.getElementById('goalTarget').value = goal.target || '';
  
        document.getElementById('cancelEdit').style.display = 'block';
    }
  }
  
  // Initialize the app when DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    new GoalManager();
  
    // Add cancel edit button functionality
    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.id = 'cancelEdit';
    cancelEditBtn.textContent = 'Cancel Edit';
    cancelEditBtn.style.display = 'none';
    cancelEditBtn.addEventListener('click', () => {
        document.getElementById('goalForm').reset();
        document.getElementById('cancelEdit').style.display = 'none';
        goalManager.editMode = false;
        goalManager.currentEditId = null;
    });
  
    document.getElementById('goalForm').appendChild(cancelEditBtn);
  });
  