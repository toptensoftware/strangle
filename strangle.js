// Helper to escape a string for use in a rgular expression
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Find the beginning of the line
 */
export function find_bol(str, pos)
{
    let i = pos;
    while (i > 0)
    {
        let cc = str.charCodeAt(i-1);
        if (cc == 13 || cc == 10)
            break;
        i--;
    }
    return i;
}

/**
 * Find the end of the line
 */
export function find_eol(str, pos)
{
    let i = pos;
    let len = str.length;
    while (i < len)
    {
        let cc = str.charCodeAt(i);
        if (cc == 13 || cc == 10)
            break;
        i++;
    }
    return i;
}

/**
 * Find the begining of a line, only skipping over white-space
 * @param {string} str The string to scan
 * @param {number} from The starting index
 * @returns {number}
 */
export function find_bol_ws(str, from)
{
    while (from > 0)
    {
        if (str[from-1] != ' ' && str[from-1] != '\t')
            break;
        from--;
    }
    return from;
}

/**
 * Find the end of a line, only skipping over white-space
 * @param {string} str The string to scan
 * @param {number} from The starting index
 * @returns {number}
 */
export function find_eol_ws(str, from)
{
    while (from < str.length)
    {
        if (str[from] != ' ' && str[from] != '\t')
            break;
        from++;
    }
    return from;
}

/**
 * Skip EOL character(s) in a string
 * @param {string} str The string to scan
 * @param {number} from The starting index
 * @returns {number}
 */
export function skip_eol(str, from)
{
    if (str[from] == '\r' && str[from + 1] == '\n')
        return from + 2;
    if (str[from] == '\n' && str[from + 1] == '\r')
        return from + 2;
    if (str[from] == '\n')
        return from + 1;
    if (str[from] == '\r')
        return from + 1;
    return from;
}

/**
 * Find the next line, only skipping white-space
 * @param {string} str The string to scan
 * @param {number} fromt The starting index
 * @returns {number}
 */
export function find_next_line_ws(str, from)
{
    return skip_eol(str, find_eol_ws(str, from));
}

let pair_cache = new Map();
function expand_pairs(str)
{
    let map = pair_cache.get(str);
    if (map)
        return map;

    map = {};
    for (let i=0; i<str.length; i+=2)
    {
        map[str[i]] = str[i+1];
    }
    pair_cache[str] = map;
    return map;
}

// STRing wrANGLE
export function strangle(str, pos)
{
    if (!pos)
        pos = 0;

    let len = str.length;
    let token;

    // Find a regular expression match
    function find(rx)
    {
        if (rx instanceof RegExp)
        {
            if (rx.flags.indexOf('g') < 0)
                throw new Error("regular expression doesn't have 'g' flag");
        }
        else
        {
            rx = new RegExp(escapeRegExp(rx), 'g');
        }
            
        rx.lastIndex = pos;
        let rxm = rx.exec(str);
        if (!rxm)
            return undefined;

        pos = rxm.index;
        return token = rxm;
    }

    // Check if current position matches a regular expression
    function match(rx)
    {
        if (rx instanceof RegExp)
        {
            if (rx.flags.indexOf('y') < 0)
                throw new Error("regular expression doesn't have 'y' flag");
        }
        else
        {
            rx = new RegExp(escapeRegExp(rx), 'y');
        }
        
        rx.lastIndex = pos;
        let rxm = rx.exec(str);
        if (!rxm)
            return token = undefined;

        return token = rxm;
    }

    // Read characters matching a regular expression
    function read(rx)
    {
        let rxm = match(rx);
        if (rxm)
            pos += rxm[0].length;

        return token = rxm;
    }

    // Read a single character
    function readChar()
    {
        if (pos < len)
            return token = str[pos++];
        return token = undefined;
    }

    // Read all whitespace at current position
    function readWhitespace()
    {
        token = read(/\s*/y)[0];
        if (token.length == 0)
            token = undefined;
        return token;
    }

    // Read a simple identifier at current position
    function readIdentifier()
    {
        let id = read(/[a-zA-Z_$][a-zA-Z0-9_$]*/y);
        return token = (id ? id[0] : undefined);
    }

    // Read a JS style string literal
    function readString()
    {
        if (str[pos] != '\"' && str[pos] != '\'' && str[pos] != '`')
            return token = undefined;
        
        let start = pos;
        let delim = str[pos++];

        let decoded = "";

        while (pos < len && str[pos] != delim)
        {
            if (str[pos] == '\\')
            {
                pos++;
                switch (str[pos])
                {
                    case '\\': decoded += '\\'; pos++; break;
                    case '\'': decoded += '\''; pos++; break;
                    case '\"': decoded += '\"'; pos++; break;
                    case 't': decoded += '\t'; pos++; break;
                    case 'r': decoded += '\r'; pos++; break;
                    case 'n': decoded += '\n'; pos++; break;
                    case '0': decoded += '\0'; pos++; break;
                    default:
                        decoded += "\\";
                        pos--;
                        break;
                }
                continue;
            }
            
            decoded += str[pos++];
        }

        if (str[pos] != delim)
        {
            pos = start;
            return token = undefined;
        }

        pos++;
        return token = {
            raw: str.substring(start, pos),
            value: decoded,
        };
    }

    // Read a nested expression
    function readNested(pairs)
    {
        // Work out pairs
        if (!pairs)
            pairs = `{}[]()""''`;
        if (typeof(pairs) === "string")
            pairs = expand_pairs(pairs);

        // Must start with a pair
        if (!pairs[str[pos]])
            return token = undefined;

        let stack = [  ];
        let start = pos;

        while (pos < len)
        {
            if (pairs[str[pos]])
            {
                // Special handling for strings
                if (str[pos] == '\"' || str[pos] == '\'')
                {
                    let ss = readString();
                    if (ss && stack.length == 0)
                    {
                        return token = str.substring(start, pos);
                    }
                    continue;
                }

                // Push to stack
                stack.unshift(str[pos]);
            }
            else if (str[pos] == pairs[stack[0]])
            {
                // Pop stack
                stack.shift();
                if (stack.length == 0)
                {
                    pos++;
                    return token = str.substring(start, pos);
                }
            }

            pos++;
        }

        pos = start;
        return token =undefined;
    }

    // Read line end characters at current position
    function readLineEnd()
    {
        let start = pos;
        pos = skip_eol(str, pos);
        if (pos == start)
            return undefined;
        return token = str.substring(start, pos);
    }

    // Read everything up to the next line end
    function readToEndOfLine()
    {
        let start = pos;
        pos = find_eol(str, pos);
        return token = str.substring(start, pos);
    }

    // Read everything up to the start of the next line
    function readToNextLine()
    {
        let rest = readToEndOfLine();
        let le = readLineEnd();
        if (le)
            return token = (rest + le);
        else
            return token = rest;
    }

    function readInteger()
    {
        let text = read(/(?:0[xX]|[+-]?)?[0-9]+/y);
        if (!text)
        return token = undefined;
        return token = parseInt(text[0]);
    }

    function readFloat()
    {
        let text = read(/[+-]?\d*(?:[.]\d*)?(?:[eE][+-]?\d+)?/y);
        if (!text)
            return token = undefined;
        return token = parseFloat(text);
    }

    function readBoolean()
    {
        let text = read(/true|false/y);
        if (!text)
            return token = undefined;
        return token = text[0] == "true";
    }

    function moveToStartOfLine()
    {
        pos = find_bol(str, pos);
    }

    function moveToEndOfLine()
    {
        pos = find_eol(str, pos);
    }

    function moveToNextLine()
    {
        pos = find_eol(str, pos);
        readLineEnd();
    }

    function moveToStartOfLineWS()
    {
        pos = find_bol_ws(str, pos);
    }

    function moveToEndOfLineWS()
    {
        pos = find_eol_ws(str, pos);
    }

    function moveToNextLineWS()
    {
        pos = find_next_line_ws(str, pos);
    }

    function save()
    {
        return { str, pos, len, token, }
    }

    function restore(state)
    {
        ({ str, pos, len, token } = state);
    }

    // API
    return {
        save,
        restore,
        find,
        match,
        read,
        readChar,
        readWhitespace,
        readIdentifier,
        readString,
        readNested,
        readToEndOfLine,
        readLineEnd,
        readToNextLine,
        readInteger,
        readFloat,
        readBoolean,
        moveToStartOfLine,
        moveToEndOfLine,
        moveToNextLine,
        moveToStartOfLineWS,
        moveToEndOfLineWS,
        moveToNextLineWS,
        substring(start, end) { return str.substring(start, end); },
        get token()
        {
            return token;
        },
        get head()
        {
            return str.substring(0, pos);
        },
        get tail()
        {
            return str.substring(pos);
        },
        get current()
        {
            return str[pos];
        },
        get pos()
        {  
            return pos;
        },
        set pos(value)
        {
            pos = value;
        },
        get bof()
        {
            return pos == 0;
        },
        get eof()
        {
            return pos >= len;
        },
        get bol()
        {
            return find_bol(str, pos) == pos;
        },
        get eol()
        {
            return find_eol(str, pos) == pos;
        }

    }
}
