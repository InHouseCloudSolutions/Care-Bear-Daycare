import { coverLayout } from './frame-photo';

describe('coverLayout', () => {
  it('centers a wide photo in the square at the default zoom', () => {
    const layout = coverLayout(400, 200, 280, 1, 0, 0);
    expect(layout.sourceSize).toBeCloseTo(200);
    expect(layout.sourceY).toBeCloseTo(0);
    expect(layout.sourceX + layout.sourceSize / 2).toBeCloseTo(200);
  });

  it('zooms in on the center and clamps a drag to the photo edge', () => {
    const zoomed = coverLayout(400, 200, 280, 2, 0, 0);
    expect(zoomed.sourceSize).toBeCloseTo(100);
    expect(zoomed.sourceX + zoomed.sourceSize / 2).toBeCloseTo(200);
    expect(zoomed.sourceY + zoomed.sourceSize / 2).toBeCloseTo(100);

    const shoved = coverLayout(400, 200, 280, 2, 5000, -5000);
    expect(shoved.sourceX).toBeCloseTo(0);
    expect(shoved.sourceY).toBeGreaterThanOrEqual(0);
    expect(shoved.sourceY + shoved.sourceSize).toBeLessThanOrEqual(200 + 0.01);
  });
});
