import { strict as assert } from "node:assert";
import { test } from "node:test";
import { strangle } from "./strangle.js"


test("find", () => {

    let s = strangle("123 hello 123");
    let r = s.find("hello");
    assert.equal(r[0], "hello");
    assert.equal(s.pos, 4);
    assert.equal(r, s.token);
});

test("match", () => {

    let s = strangle("123 hello 123");
    let r = s.match("hello");
    assert.equal(r, undefined);

    s.pos = 4;
    r = s.match("hello");
    assert.equal(r[0], "hello");
    assert.equal(s.pos, 4);
    assert.equal(r, s.token);
});

test("read", () => {

    let s = strangle("123 hello 123", 4);
    let r = s.read("hello");
    assert.equal(r[0], "hello");
    assert.equal(s.pos, 9);
    assert.equal(r, s.token);
});

test("readChar", () => {

    let s = strangle("123");
    assert.equal(s.readChar(), "1");
    assert.equal(s.token, "1");
    assert.equal(s.readChar(), "2");
    assert.equal(s.token, "2");
    assert.equal(s.readChar(), "3");
    assert.equal(s.token, "3");
});

test("readWhitespace", () => {

    let s = strangle("   \n\n\nABC");
    assert.equal(s.readWhitespace(), "   \n\n\n");
    assert.equal(s.token, "   \n\n\n");
    assert.equal(s.pos, 6);
    assert.equal(s.readWhitespace(), undefined);
    assert.equal(s.token, undefined);
});


test("readIdentifier", () => {

    let s = strangle("apples$123[]");
    assert.equal(s.readIdentifier(), "apples$123");
    assert.equal(s.token, "apples$123");
    assert.equal(s.pos, 10);
    assert.equal(s.readIdentifier(), undefined);
    assert.equal(s.token, undefined);
});


test("readString (double quotes)", () => {

    let s = strangle("'Hello \\\"World\\\"' after");
    let str = s.readString();
    assert.equal(str.value, "Hello \"World\"");
    assert.equal(str.raw, "'Hello \\\"World\\\"'");
    assert.deepEqual(str, s.token);
    
});




test("readNested", () => {

    let s = strangle("({[{(\"in)}]\")}]}) after");
    let str = s.readNested();
    assert.equal(str, "({[{(\"in)}]\")}]})");
    assert.equal(str, s.token);
    
});


test("readLineEnd", () => {

    let s = strangle("\r\n");
    let str = s.readLineEnd();
    assert.equal(str, "\r\n");
    assert.equal(str, s.token);

    s = strangle("\n\r");
    str = s.readLineEnd();
    assert.equal(str, "\n\r");
    assert.equal(str, s.token);

    s = strangle("\n");
    str = s.readLineEnd();
    assert.equal(str, "\n");
    assert.equal(str, s.token);

    s = strangle("\r");
    str = s.readLineEnd();
    assert.equal(str, "\r");
    assert.equal(str, s.token);
});


test("readToEndOfLine", () => {

    let s = strangle("Hello World\r\nNext", 6);
    let str = s.readToEndOfLine();
    assert.equal(str, "World");
    assert.equal(str, s.token);
});


test("readToNextLine", () => {

    let s = strangle("Hello World\r\nNext", 6);
    let str = s.readToNextLine();
    assert.equal(str, "World\r\n");
    assert.equal(str, s.token);
});


test("readInteger", () => {

    let s = strangle("123pos");
    let val = s.readInteger();
    assert.equal(val, 123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 3);

    s = strangle("0x123");
    val = s.readInteger();
    assert.equal(val, 0x123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 5);

    s = strangle("-123");
    val = s.readInteger();
    assert.equal(val, -123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 4);

    s = strangle("+123");
    val = s.readInteger();
    assert.equal(val, 123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 4);

});


test("readFloat", () => {

    let s = strangle("123pos");
    let val = s.readFloat();
    assert.equal(val, 123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 3);

    s = strangle("-123.45");
    val = s.readFloat();
    assert.equal(val, -123.45);
    assert.equal(val, s.token);
    assert.equal(s.pos, 7);

    s = strangle("+123.45");
    val = s.readFloat();
    assert.equal(val, 123.45);
    assert.equal(val, s.token);
    assert.equal(s.pos, 7);

    s = strangle("123e123");
    val = s.readFloat();
    assert.equal(val, 123e123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 7);

    s = strangle("123e-123");
    val = s.readFloat();
    assert.equal(val, 123e-123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 8);

    s = strangle("123e+123");
    val = s.readFloat();
    assert.equal(val, 123e+123);
    assert.equal(val, s.token);
    assert.equal(s.pos, 8);

});



test("readBoolean", () => {

    let s = strangle("true");
    let val = s.readBoolean();
    assert.equal(val, true);

    s = strangle("false");
    val = s.readBoolean();
    assert.equal(val, false);

    s = strangle("other");
    val = s.readBoolean();
    assert.equal(val, undefined);
});



test("moveToStartOfLine", () => {

    let s = strangle("line 1\nline 2\nline 3");

    s.pos = 3;
    s.moveToStartOfLine();
    assert.equal(s.pos, 0);
    assert(s.bol);

    s.pos = 10;
    s.moveToStartOfLine();
    assert.equal(s.pos, 7);
    assert(s.bol);

});


test("moveToEndOfLine", () => {

    let s = strangle("line 1\nline 2\nline 3");

    s.pos = 3;
    s.moveToEndOfLine();
    assert.equal(s.pos, 6);
    assert(s.eol);

    s.pos = 10;
    s.moveToEndOfLine();
    assert.equal(s.pos, 13);
    assert(s.eol);

});


test("moveToNextLine", () => {

    let s = strangle("line 1\nline 2\nline 3");

    s.pos = 3;
    s.moveToNextLine();
    assert.equal(s.pos, 7);
    assert(s.bol);

    s.pos = 10;
    s.moveToNextLine();
    assert.equal(s.pos, 14);
    assert(s.bol);
});

test("moveToStartOfLineWS", () => {

    let s = strangle("line    x", 8);
    s.moveToStartOfLineWS();
    assert.equal(s.pos, 4);
});


test("moveToEndOfLineWS", () => {

    let s = strangle("   x    end", 4);
    s.moveToEndOfLineWS();
    assert.equal(s.pos, 8);
});

test("moveToNextLineWS", () => {

    let s = strangle("   x    end\n", 4);
    s.moveToEndOfLineWS();
    assert.equal(s.pos, 8);
});


test("save/restore", () => {

    let s = strangle("12345");
    s.readInteger();

    let save = s.save();
    s.pos = 0;
    s.restore(save);

    assert.equal(s.pos, 5);
    assert.equal(s.token, 12345);
});

test("bof/eof/bol/eol", () => {
    let s = strangle("12345\n12345");
    assert(s.bof);
    assert(s.bol);
    assert(!s.eof);
    assert(!s.eol);

    s.pos = 5;
    assert(!s.bof);
    assert(!s.bol);
    assert(!s.eof);
    assert(s.eol);

    s.pos = 6;
    assert(!s.bof);
    assert(s.bol);
    assert(!s.eof);
    assert(!s.eol);

    s.pos = 11;
    assert(!s.bof);
    assert(!s.bol);
    assert(s.eof);
    assert(s.eol);
});