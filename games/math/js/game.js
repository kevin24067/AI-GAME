/**
 * 算术小游戏主逻辑
 */
class MathGame {
    constructor() {
        this.grade = 1; // 默认一年级
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.answers = []; // 存储用户的答案
        
        // 初始化游戏记录追踪器
        this.gameTracker = null;
        this.initGameTracker();
        
        // DOM元素
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.resultScreen = document.getElementById('resultScreen');
        this.currentQuestionElement = document.getElementById('currentQuestion');
        this.timerElement = document.getElementById('timer');
        this.questionElement = document.getElementById('question');
        this.answerInput = document.getElementById('answerInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalTimeElement = document.getElementById('finalTime');
        this.questionListElement = document.getElementById('questionList');
        this.wrongQuestionListElement = document.getElementById('wrongQuestionList');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.changeGradeBtn = document.getElementById('changeGradeBtn');
        
        // 绑定事件
        this.bindEvents();
    }

    // 初始化游戏记录追踪器
    async initGameTracker() {
        try {
            // 等待 Supabase 初始化
            setTimeout(async () => {
                if (window.SupabaseClient) {
                    await window.SupabaseClient.init();
                    this.gameTracker = new window.GameTracker('算术小游戏');
                    console.log('算术游戏记录追踪器已初始化');
                }
            }, 1000);
        } catch (error) {
            console.error('初始化游戏追踪器失败:', error);
        }
    }
    
    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        // 年级选择按钮
        const gradeButtons = document.querySelectorAll('.grade-btn');
        gradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.grade = parseInt(button.dataset.grade);
                this.startGame();
            });
        });
        
        // 提交答案按钮
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        
        // 回车键提交答案
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // 再玩一次按钮
        this.playAgainBtn.addEventListener('click', () => this.startGame());
        
        // 更换年级按钮
        this.changeGradeBtn.addEventListener('click', () => this.showStartScreen());
    }
    
    /**
     * 显示开始界面
     */
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.resultScreen.classList.add('hidden');
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        // 生成题目
        const generator = new QuestionGenerator(this.grade);
        this.questions = generator.generateQuestionSet(10);
        
        // 重置游戏状态
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        
        // 显示游戏界面
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.resultScreen.classList.add('hidden');
        
        // 显示第一题
        this.showQuestion();
        
        // 开始计时
        this.startTime = Date.now();
        this.updateTimer();
    }
    
    /**
     * 显示当前题目
     */
    showQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.questionElement.textContent = question.question;
        this.currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        this.answerInput.value = '';
        this.answerInput.focus();
    }
    
    /**
     * 更新计时器
     */
    updateTimer() {
        const elapsedTime = Date.now() - this.startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        
        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (!this.gameOver) {
            requestAnimationFrame(() => this.updateTimer());
        }
    }
    
    /**
     * 提交答案
     */
    submitAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        // 检查答案是否为空或非数字
        if (isNaN(userAnswer)) {
            alert('请输入有效的数字答案！');
            this.answerInput.focus();
            return;
        }
        
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = userAnswer === currentQuestion.answer;
        
        // 记录答案
        this.answers.push({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.answer,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
        
        // 更新分数
        if (isCorrect) {
            this.score++;
        }
        
        // 进入下一题或结束游戏
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.showQuestion();
        } else {
            this.endGame();
        }
    }
    
    /**
     * 结束游戏
     */
    async endGame() {
        this.gameOver = true;
        this.endTime = Date.now();
        const totalTime = this.endTime - this.startTime;
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        
        // 更新游戏追踪器
        if (this.gameTracker) {
            this.gameTracker.updateScore(this.score * 10); // 每题10分
            this.gameTracker.updateLevel(this.grade); // 年级作为关卡
            
            // 保存游戏记录
            try {
                const result = await this.gameTracker.saveGameRecord();
                if (result.success) {
                    console.log('算术游戏记录已保存');
                } else {
                    console.log('游戏记录保存失败:', result.message || result.error);
                }
            } catch (error) {
                console.error('保存游戏记录时出错:', error);
            }
        }
        
        // 更新结果界面
        this.finalScoreElement.textContent = this.score;
        this.finalTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 生成答题详情
        this.generateQuestionList();
        
        // 生成错题总结
        this.generateWrongQuestionList();
        
        // 显示结果界面
        this.gameScreen.classList.add('hidden');
        this.resultScreen.classList.remove('hidden');
    }
    
    /**
     * 生成答题详情列表
     */
    generateQuestionList() {
        this.questionListElement.innerHTML = '';
        
        this.answers.forEach((answer, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = `question-item ${answer.isCorrect ? 'correct' : 'wrong'}`;
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${answer.question}`;
            
            const answerText = document.createElement('div');
            answerText.className = 'answer-text';
            if (answer.isCorrect) {
                answerText.textContent = `✓ ${answer.userAnswer}`;
            } else {
                answerText.textContent = `✗ 你的答案: ${answer.userAnswer}, 正确答案: ${answer.correctAnswer}`;
            }
            
            questionItem.appendChild(questionText);
            questionItem.appendChild(answerText);
            this.questionListElement.appendChild(questionItem);
        });
    }
    
    /**
     * 生成错题总结
     */
    generateWrongQuestionList() {
        this.wrongQuestionListElement.innerHTML = '';
        
        const wrongAnswers = this.answers.filter(answer => !answer.isCorrect);
        
        if (wrongAnswers.length === 0) {
            const perfectScore = document.createElement('div');
            perfectScore.className = 'perfect-score';
            perfectScore.textContent = '太棒了！你全部答对了！';
            this.wrongQuestionListElement.appendChild(perfectScore);
            return;
        }
        
        wrongAnswers.forEach((answer, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item wrong';
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${answer.question}`;
            
            const answerText = document.createElement('div');
            answerText.className = 'answer-text';
            answerText.textContent = `你的答案: ${answer.userAnswer}, 正确答案: ${answer.correctAnswer}`;
            
            questionItem.appendChild(questionText);
            questionItem.appendChild(answerText);
            this.wrongQuestionListElement.appendChild(questionItem);
        });
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    const game = new MathGame();
});