import { Decay, DecayType } from './index';

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Decay', () => {
  it(`should initialize with empty config`, () => {
    const decay = new Decay();
    expect(decay).toBeInstanceOf(Decay);
  });

  it(`should work with default config`, async () => {
    const decay = new Decay();
    decay.start();
    await wait(1010);
    expect(decay.value).toBe(0);
    decay.stop();
  });

  it(`should trigger wait on min value`, async () => {
    const decay = new Decay({ interval: 10 });
    decay.start();
    const value = await decay.wait();
    expect(value).toBe(0);
    decay.stop();
  });

  it(`should trigger wait on max value`, async () => {
    const decay = new Decay({ interval: 10, maxValue: 10, decayValue: 0.0001 });
    decay.start();
    const promise = decay.wait();
    decay.value = 1000;
    const value = await promise;
    expect(value).toBe(10);
    decay.stop();
  });

  it(`should trigger wait on stop`, async () => {
    const decay = new Decay();
    decay.start();
    const promise = decay.wait();
    decay.stop();
    const value = await promise;
    expect(value).toBe(1);
  });

  it(`should emit on min`, async () => {
    const decay = new Decay({ interval: 10 });
    let triggerValue;
    decay.on('min', (v) => (triggerValue = v));
    decay.start();
    await decay.wait();
    decay.stop();
    expect(triggerValue).toBe(0);
  });

  it(`should emit on max`, async () => {
    const decay = new Decay({ interval: 10, maxValue: 10 });
    let triggerValue;
    decay.on('max', (v) => (triggerValue = v));
    decay.start();
    decay.increment(1000);
    await decay.wait();
    decay.stop();
    expect(triggerValue).toBe(10);
  });

  it(`should emit on stop`, async () => {
    const decay = new Decay();
    let triggerValue;
    decay.on('stop', (v) => (triggerValue = v));
    decay.start();
    decay.stop();
    await wait(10);
    expect(triggerValue).toBe(1);
  });

  it(`should decay exponentially`, async () => {
    const decay = new Decay({
      interval: 10,
      decayValue: 0.1,
      type: DecayType.Exponential,
    });
    const t0 = Date.now();
    decay.start();
    await decay.wait();
    decay.stop();
    const dt = Date.now() - t0;
    expect(dt).toBeLessThan(40);
  });
});
