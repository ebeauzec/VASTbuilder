import sys

def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    # We will use a state stack to keep track of string/comment states
    # States: 'normal', 'single_quote', 'double_quote', 'template_literal', 'line_comment', 'block_comment'
    state_stack = ['normal']
    escape = False
    
    line = 1
    col = 1
    
    i = 0
    n = len(content)
    while i < n:
        c = content[i]
        
        # Track line numbers
        if c == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        if escape:
            escape = False
            i += 1
            continue
            
        current_state = state_stack[-1]
        
        if current_state == 'line_comment':
            if c == '\n':
                state_stack.pop()
            i += 1
            continue
            
        if current_state == 'block_comment':
            if c == '*' and i + 1 < n and content[i+1] == '/':
                state_stack.pop()
                i += 2
                continue
            i += 1
            continue
            
        if current_state == 'single_quote':
            if c == '\\':
                escape = True
            elif c == "'":
                state_stack.pop()
            i += 1
            continue
            
        if current_state == 'double_quote':
            if c == '\\':
                escape = True
            elif c == '"':
                state_stack.pop()
            i += 1
            continue
            
        if current_state == 'template_literal':
            if c == '\\':
                escape = True
            elif c == '`':
                state_stack.pop()
            elif c == '$' and i + 1 < n and content[i+1] == '{':
                # Switch to parsing normal JS expression inside template literal
                state_stack.append('normal')
                stack.append(('${', line, col))
                i += 2
                continue
            i += 1
            continue
            
        # If state is 'normal'
        # Check comments start
        if c == '/' and i + 1 < n:
            if content[i+1] == '/':
                state_stack.append('line_comment')
                i += 2
                continue
            elif content[i+1] == '*':
                state_stack.append('block_comment')
                i += 2
                continue
                
        # Check string quotes start
        if c == "'":
            state_stack.append('single_quote')
            i += 1
            continue
        if c == '"':
            state_stack.append('double_quote')
            i += 1
            continue
        if c == '`':
            state_stack.append('template_literal')
            i += 1
            continue
            
        # Braces checks
        if c in '({[':
            stack.append((c, line, col))
        elif c in ')}]':
            if not stack:
                print(f"Error: Unmatched closing character '{c}' at line {line}, col {col}")
                return False
            top, t_line, t_col = stack.pop()
            if c == '}':
                if top == '${':
                    # End of template literal expression, return to template literal state
                    if state_stack[-1] == 'normal' and len(state_stack) > 1:
                        state_stack.pop()
                elif top != '{':
                    print(f"Error: Mismatched character '}}' at line {line}, col {col} (expected match for '{top}' from line {t_line}, col {t_col})")
                    return False
            elif c == ')':
                if top != '(':
                    print(f"Error: Mismatched character ')' at line {line}, col {col} (expected match for '{top}' from line {t_line}, col {t_col})")
                    return False
            elif c == ']':
                if top != '[':
                    print(f"Error: Mismatched character ']' at line {line}, col {col} (expected match for '{top}' from line {t_line}, col {t_col})")
                    return False
                    
        i += 1
        
    if stack:
        print(f"Error: Unmatched opening characters at end of file:")
        for item in stack:
            print(f"  '{item[0]}' from line {item[1]}, col {item[2]}")
        return False
        
    print("Success: All braces, parentheses, and brackets are perfectly balanced!")
    return True

if __name__ == '__main__':
    check_braces("/Users/eugenebeauzec/Documents/AntiGravity/VAST/app.js")
