//npm init -y
//npm install express multer cors

class AutoCommentor {
    constructor() {
        this.supportedLanguages = ['javascript', 'js'];
    }

    extractFunctionName(line) {
        if (line.startsWith('function ')) {
            return line.replace('function ', '').split('(')[0].trim();
        }
        
        const constMatch = line.match(/const\s+(\w+)\s*=\s*\(/);
        if (constMatch) {
            return constMatch[1];
        }
        
        const funcMatch = line.match(/const\s+(\w+)\s*=\s*function/);
        if (funcMatch) {
            return funcMatch[1];
        }
        
        return 'anonymous';
    }

    extractFunctionParams(line) {
        const paramMatch = line.match(/\((.*?)\)/);
        if (paramMatch && paramMatch[1]) {
            return paramMatch[1].split(',').map(param => param.trim()).filter(param => param.length > 0);
        }
        return [];
    }

    analyzeFunctionComplexity(func) {
        // Simple analysis of function complexity
        const lines = func.code.split('\n').length;
        const hasReturn = func.code.includes('return');
        const hasLogic = func.code.includes('if') || func.code.includes('for') || func.code.includes('while');
        
        if (lines > 5 || hasLogic) return 'complex';
        if (lines > 2 || hasReturn) return 'medium';
        return 'simple';
    }

    generateFunctionComment(func) {
        const complexity = this.analyzeFunctionComplexity(func);
        const params = func.params;
        
        let comment = '';
        
        switch(complexity) {
            case 'complex':
                comment = `// Function ${func.name} defined - ${params.length > 0 ? 'takes ' + params.join(', ') + ' as parameters' : 'no parameters'}. `;
                comment += `Contains complex logic with multiple operations.`;
                break;
                
            case 'medium':
                comment = `// Function ${func.name} defined - ${params.length > 0 ? 'accepts parameters: ' + params.join(', ') : 'no parameters required'}. `;
                comment += `Performs specific operations and ${func.code.includes('return') ? 'returns a value' : 'executes actions'}.`;
                break;
                
            case 'simple':
            default:
                comment = `// Function ${func.name} defined - ${params.length > 0 ? 'parameters: ' + params.join(', ') : 'no parameters'}. `;
                comment += `Simple utility function.`;
                break;
        }
        
        return comment;
    }

    generateVariableComment(variable) {
        const type = variable.type;
        let purpose = '';
        
        // Guess variable purpose based on name patterns
        if (variable.name.includes('List') || variable.name.includes('Array') || variable.name.endsWith('s')) {
            purpose = 'collection of items';
        } else if (variable.name.includes('Count') || variable.name.includes('Total')) {
            purpose = 'counter or total value';
        } else if (variable.name.includes('Flag') || variable.name.includes('Is') || variable.name.includes('Has')) {
            purpose = 'boolean flag';
        } else if (variable.name.includes('Name') || variable.name.includes('Title')) {
            purpose = 'text identifier';
        } else if (variable.name.includes('Data') || variable.name.includes('Info')) {
            purpose = 'data container';
        } else if (variable.name.includes('Result') || variable.name.includes('Output')) {
            purpose = 'computation result';
        } else if (variable.name.length <= 3) {
            purpose = 'temporary variable';
        } else {
            purpose = 'data storage';
        }
        
        return `// ${type} variable ${variable.name} created - used for ${purpose}.`;
    }

    generateClassComment(cls) {
        return `// Class ${cls.name} defined - represents a entity or component with related properties and methods.`;
    }

    parseCode(code) {
        console.log("Parsing code...");
        
        const structures = {
            functions: [],
            variables: [],
            classes: [],
            comments: []
        };

        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Find function declarations
            if (trimmedLine.startsWith('function ') || 
                trimmedLine.match(/const\s+\w+\s*=\s*\(.*\)\s*=>/) ||
                trimmedLine.match(/const\s+\w+\s*=\s*function/)) {
                
                const funcName = this.extractFunctionName(trimmedLine);
                const params = this.extractFunctionParams(trimmedLine);
                
                structures.functions.push({
                    name: funcName,
                    line: index + 1,
                    code: trimmedLine,
                    params: params,
                    isArrow: trimmedLine.includes('=>'),
                    isAnonymous: funcName === 'anonymous'
                });
            }
            
            // Find class declarations
            else if (trimmedLine.startsWith('class ')) {
                const className = trimmedLine.replace('class ', '').split(' ')[0].split('{')[0];
                structures.classes.push({
                    name: className,
                    line: index + 1,
                    code: trimmedLine
                });
            }
            
            // Find variable declarations (const/let)
            else if ((trimmedLine.startsWith('const ') || trimmedLine.startsWith('let ')) && 
                     !trimmedLine.includes('function') && !trimmedLine.includes('=>')) {
                const varName = trimmedLine.split(' ')[1].split('=')[0].trim();
                structures.variables.push({
                    name: varName,
                    line: index + 1,
                    code: trimmedLine,
                    type: trimmedLine.startsWith('const ') ? 'const' : 'let'
                });
            }
        });

        console.log(`Found: ${structures.functions.length} functions, ${structures.classes.length} classes, ${structures.variables.length} variables`);
        return structures;
    }

    generateComments(structures) {
        const comments = [];

        // Detailed comments for named functions
        structures.functions.forEach(func => {
            if (func.name !== 'anonymous' && !func.isArrow) {
                const comment = this.generateFunctionComment(func);
                comments.push({
                    type: 'function',
                    name: func.name,
                    line: func.line,
                    comment: comment
                });
            }
        });

        // Detailed comments for classes
        structures.classes.forEach(cls => {
            if (cls.name && cls.name !== 'anonymous') {
                const comment = this.generateClassComment(cls);
                comments.push({
                    type: 'class',
                    name: cls.name,
                    line: cls.line,
                    comment: comment
                });
            }
        });

        // Detailed comments for meaningful variables
        structures.variables.forEach(variable => {
            const isSimpleVariable = variable.name.length <= 2 || 
                                   ['i', 'j', 'k', 'x', 'y', 'z', 'cb', 'fn', 'arr', 'obj', 'num', 'str', 'tmp', 'temp'].includes(variable.name);
        
            if (!isSimpleVariable && variable.name.length > 2) {
                const comment = this.generateVariableComment(variable);
                comments.push({
                    type: 'variable',
                    name: variable.name,
                    line: variable.line,
                    comment: comment
                });
            }
        });

        return comments.sort((a, b) => b.line - a.line);
    }

    insertComments(originalCode, comments) {
        let lines = originalCode.split('\n');
        
        // Insert comments in reverse order to maintain correct line numbers
        comments.forEach(comment => {
            lines.splice(comment.line - 1, 0, comment.comment);
        });

        return lines.join('\n');
    }

    processCode(code, language = 'javascript') {
        if (!this.supportedLanguages.includes(language.toLowerCase())) {
            throw new Error(`Unsupported language: ${language}. Supported: ${this.supportedLanguages.join(', ')}`);
        }

        console.log("Starting code processing...");
        const structures = this.parseCode(code);
        const comments = this.generateComments(structures);
        const commentedCode = this.insertComments(code, comments);

        return {
            originalCode: code,
            commentedCode: commentedCode,
            structures: structures,
            comments: comments,
            stats: {
                functions: structures.functions.length,
                classes: structures.classes.length,
                variables: structures.variables.length,
                commentsAdded: comments.length
            }
        };
    }
}

module.exports = AutoCommentor;