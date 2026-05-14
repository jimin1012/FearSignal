import { describe, expect, it } from "vitest";
import { malformedCnnPayload, validCnnPayload } from "../../../test/fixtures";
import { parseCnnFearGreed } from "./cnnFearGreed";

describe("parseCnnFearGreed", () => {
  it("parses healthy CNN payload", () => {
    const result = parseCnnFearGreed(validCnnPayload);
    expect(result.score).toBe(31);
    expect(result.rating).toBe("fear");
  });

  it("rejects malformed CNN payload", () => {
    expect(() => parseCnnFearGreed(malformedCnnPayload)).toThrow(/missing/i);
  });

  it("rejects empty CNN payload", () => {
    expect(() => parseCnnFearGreed({})).toThrow(/missing/i);
  });
});
