import { parseCode } from './openai'

test('parseCode', () => {
    expect(parseCode('window.run=aaa', 'window.run')).toBe('window.run=aaa');
    expect(parseCode("```\n\
window.run=function() {}\n\
```", 'window.run')).toBe('window.run=function() {}');

    expect(parseCode("Here is some explain\n\
    ```\n\
window.run=function() {}\n\
    ```\n\
the end", 'window.run')).toBe('window.run=function() {}');
});