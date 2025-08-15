/**
 * 算术题目生成器
 * 根据年级生成相应难度的算术题
 */
class QuestionGenerator {
    constructor(grade) {
        this.grade = grade;
        this.operations = this.getOperationsForGrade(grade);
        this.maxNumber = this.getMaxNumberForGrade(grade);
    }
    
    /**
     * 根据年级获取可用的运算符
     */
    getOperationsForGrade(grade) {
        switch(grade) {
            case 1: // 一年级：加法和减法（不需要借位）
                return ['+', '-'];
            case 2: // 二年级：加法和减法
                return ['+', '-'];
            case 3: // 三年级：加法、减法和乘法
                return ['+', '-', '*'];
            case 4: // 四年级：加法、减法、乘法和除法（整除）
                return ['+', '-', '*', '/'];
            case 5: // 五年级：加法、减法、乘法和除法
                return ['+', '-', '*', '/', 'mixed'];
            case 6: // 六年级：加法、减法、乘法、除法和混合运算
                return ['+', '-', '*', '/', 'mixed'];
            default:
                return ['+', '-'];
        }
    }
    
    /**
     * 根据年级获取最大数值
     */
    getMaxNumberForGrade(grade) {
        switch(grade) {
            case 1: return 20;
            case 2: return 100;
            case 3: return 1000;
            case 4: return 10000;
            case 5: return 100000;
            case 6: return 1000000;
            default: return 100;
        }
    }
    
    /**
     * 生成随机数
     */
    getRandomNumber(max) {
        return Math.floor(Math.random() * max) + 1;
    }
    
    /**
     * 生成一道算术题
     */
    generateQuestion() {
        // 随机选择运算符
        const operationIndex = Math.floor(Math.random() * this.operations.length);
        const operation = this.operations[operationIndex];
        
        if (operation === 'mixed') {
            return this.generateMixedQuestion();
        }
        
        let num1, num2, answer, questionText;
        
        switch(operation) {
            case '+': // 加法
                num1 = this.getRandomNumber(this.maxNumber);
                num2 = this.getRandomNumber(this.maxNumber);
                answer = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
                break;
                
            case '-': // 减法
                if (this.grade === 1) {
                    // 一年级减法不需要借位
                    num2 = this.getRandomNumber(10);
                    num1 = num2 + this.getRandomNumber(10); // 确保结果为正数
                } else {
                    num1 = this.getRandomNumber(this.maxNumber);
                    num2 = this.getRandomNumber(num1); // 确保结果为正数
                }
                answer = num1 - num2;
                questionText = `${num1} - ${num2} = ?`;
                break;
                
            case '*': // 乘法
                const maxFactor = Math.min(20, Math.sqrt(this.maxNumber));
                num1 = this.getRandomNumber(maxFactor);
                num2 = this.getRandomNumber(maxFactor);
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
                break;
                
            case '/': // 除法（整除）
                num2 = this.getRandomNumber(12); // 除数
                answer = this.getRandomNumber(Math.min(100, this.maxNumber / num2)); // 商
                num1 = num2 * answer; // 被除数
                questionText = `${num1} ÷ ${num2} = ?`;
                break;
        }
        
        return {
            question: questionText,
            answer: answer,
            operation: operation
        };
    }
    
    /**
     * 生成混合运算题
     */
    generateMixedQuestion() {
        // 简单的两步混合运算
        const operations = ['+', '-', '*', '/'].filter(op => 
            this.operations.includes(op) && op !== 'mixed'
        );
        
        const op1 = operations[Math.floor(Math.random() * operations.length)];
        const op2 = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, num3, intermediateResult, finalResult, questionText;
        
        // 生成第一个操作数
        num1 = this.getRandomNumber(Math.min(50, this.maxNumber / 10));
        
        // 生成第二个操作数和中间结果
        switch(op1) {
            case '+':
                num2 = this.getRandomNumber(Math.min(50, this.maxNumber / 10));
                intermediateResult = num1 + num2;
                break;
            case '-':
                num2 = this.getRandomNumber(num1);
                intermediateResult = num1 - num2;
                break;
            case '*':
                num2 = this.getRandomNumber(10);
                intermediateResult = num1 * num2;
                break;
            case '/':
                num2 = this.getRandomNumber(10);
                while (num1 % num2 !== 0) { // 确保整除
                    num1 = this.getRandomNumber(Math.min(100, this.maxNumber / 10));
                }
                intermediateResult = num1 / num2;
                break;
        }
        
        // 生成第三个操作数和最终结果
        switch(op2) {
            case '+':
                num3 = this.getRandomNumber(Math.min(50, this.maxNumber / 10));
                finalResult = intermediateResult + num3;
                break;
            case '-':
                num3 = this.getRandomNumber(Math.min(intermediateResult, 50));
                finalResult = intermediateResult - num3;
                break;
            case '*':
                num3 = this.getRandomNumber(10);
                finalResult = intermediateResult * num3;
                break;
            case '/':
                num3 = this.getRandomNumber(10);
                while (intermediateResult % num3 !== 0) { // 确保整除
                    num3 = this.getRandomNumber(Math.min(intermediateResult, 10));
                    if (num3 === 1) break; // 避免无限循环
                }
                finalResult = intermediateResult / num3;
                break;
        }
        
        // 根据年级决定是否使用括号
        if (this.grade >= 5 && Math.random() > 0.5) {
            questionText = `${num1} ${op1} (${num2} ${op2} ${num3}) = ?`;
            
            // 重新计算结果（括号内先计算）
            let bracketResult;
            switch(op2) {
                case '+': bracketResult = num2 + num3; break;
                case '-': bracketResult = num2 - num3; break;
                case '*': bracketResult = num2 * num3; break;
                case '/': bracketResult = num2 / num3; break;
            }
            
            switch(op1) {
                case '+': finalResult = num1 + bracketResult; break;
                case '-': finalResult = num1 - bracketResult; break;
                case '*': finalResult = num1 * bracketResult; break;
                case '/': 
                    // 确保能整除
                    if (num1 % bracketResult !== 0) {
                        num1 = bracketResult * this.getRandomNumber(10);
                    }
                    finalResult = num1 / bracketResult; 
                    break;
            }
        } else {
            questionText = `${num1} ${op1} ${num2} ${op2} ${num3} = ?`;
            
            // 按照从左到右的顺序计算（没有括号）
            switch(op1) {
                case '+': intermediateResult = num1 + num2; break;
                case '-': intermediateResult = num1 - num2; break;
                case '*': intermediateResult = num1 * num2; break;
                case '/': intermediateResult = num1 / num2; break;
            }
            
            switch(op2) {
                case '+': finalResult = intermediateResult + num3; break;
                case '-': finalResult = intermediateResult - num3; break;
                case '*': finalResult = intermediateResult * num3; break;
                case '/': finalResult = intermediateResult / num3; break;
            }
        }
        
        return {
            question: questionText,
            answer: finalResult,
            operation: 'mixed'
        };
    }
    
    /**
     * 生成一组题目
     */
    generateQuestionSet(count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateQuestion());
        }
        return questions;
    }
}