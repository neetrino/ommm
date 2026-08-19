import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateSpherePositions, projectSpherePositions } from "./sphere-image-grid.layout";

describe("sphere-image-grid.layout", () => {
  it("places a deterministic Fibonacci set without duplicates", () => {
    const first = generateSpherePositions(12, 200);
    const second = generateSpherePositions(12, 200);
    assert.equal(first.length, 12);
    assert.deepEqual(first, second);
    const keys = new Set(first.map((position) => `${position.theta}:${position.phi}`));
    assert.equal(keys.size, 12);
  });

  it("hides points that rotate behind the fade zone", () => {
    const positions = generateSpherePositions(8, 200);
    const front = projectSpherePositions(positions, { x: 0, y: 0, z: 0 }, 200, 28);
    const back = projectSpherePositions(positions, { x: 0, y: 180, z: 0 }, 200, 28);
    assert.equal(front.length, 8);
    assert.ok(front.some((position) => position.isVisible));
    assert.ok(back.some((position) => !position.isVisible || position.fadeOpacity < 1));
  });
});
