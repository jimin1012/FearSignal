import { describe, expect, it } from "vitest";
import { malformedVixCsv, missingPutCallHtml, validPutCallHtml, validVixCsv } from "../../../test/fixtures";
import { parsePutCallHtml, parseVixCsv } from "./cboe";

describe("parseVixCsv", () => {
  it("parses healthy VIX CSV", () => {
    const result = parseVixCsv(validVixCsv);
    expect(result.current).toBe(18);
    expect(result.history).toHaveLength(3);
  });

  it("rejects malformed VIX CSV", () => {
    expect(() => parseVixCsv(malformedVixCsv)).toThrow(/missing/i);
  });

  it("rejects empty VIX CSV", () => {
    expect(() => parseVixCsv("")).toThrow(/empty/i);
  });
});

describe("parsePutCallHtml", () => {
  it("parses healthy put/call HTML", () => {
    const result = parsePutCallHtml(validPutCallHtml);
    expect(result.total).toBe(0.94);
    expect(result.equity).toBe(0.62);
  });

  it("rejects missing-field put/call HTML", () => {
    expect(() => parsePutCallHtml(missingPutCallHtml)).toThrow(/missing/i);
  });
});
