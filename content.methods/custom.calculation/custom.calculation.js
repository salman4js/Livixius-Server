class CustomCalculationHandler {
    constructor(options) {
        this.options = options;
        this.precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2
        }
    };

    shuntingYardAlgo(infix){
        const outputQueue = [];
        const operatorStack = [];

        const tokens = infix.match(/(?:[A-Za-z0-9.]+)|[^\s]/g);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!isNaN(parseFloat(token))) {
                outputQueue.push(parseFloat(token));
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop();
            } else {
                while (
                    operatorStack.length &&
                    this.precedence[token] <= this.precedence[operatorStack[operatorStack.length - 1]]
                    ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        }

        while (operatorStack.length) {
            outputQueue.push(operatorStack.pop());
        }

        return outputQueue;
    };

    evaluatePostFix(postfix){
        const stack = [];

        postfix.forEach(token => {
            if (!isNaN(parseFloat(token))) {
                stack.push(parseFloat(token));
            } else {
                const operand2 = stack.pop();
                const operand1 = stack.pop();
                switch (token) {
                    case '+':
                        stack.push(operand1 + operand2);
                        break;
                    case '-':
                        stack.push(operand1 - operand2);
                        break;
                    case '*':
                        stack.push(operand1 * operand2);
                        break;
                    case '/':
                        stack.push(operand1 / operand2);
                        break;
                    default:
                        break;
                }
            }
        });

        return stack[0];
    };

    replacePlaceholders(placeholder){
        return this.options[placeholder] || 0;
    };

    generateCustomFormulaResult(options){
        if(options.customizedFormula){
            this.options = options;
            // Get the keys of the values object and join them with '|' to create a regex pattern
            const pattern = new RegExp('\\b(' + Object.keys(options).join('|') + ')\\b', 'g');
            // Replace placeholders using regular expression
            const replacedFormula = options.customizedFormula.replace(pattern, this.replacePlaceholders.bind(this));
            const postfix = this.shuntingYardAlgo(replacedFormula);
            return this.evaluatePostFix(postfix);
        } else {
            console.warn('Custom formula does not exists!');
        }
    }
}

module.exports = CustomCalculationHandler