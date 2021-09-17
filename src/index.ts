import EventEmitter from "node:events";

export enum DecayType {
  /** Value decays linearly */
  Linear,
  /** Value decays exponentially based on tick counter that is reset when it hits min and max */
  Exponential,
}

export interface DecayConfig {
  /** Initial value, default: 1 */
  initialValue: number;

  /** Decay value, default: 1 */
  decayValue: number;

  /** Minimum value, default: 0 */
  minValue: number;

  /** Maximum value, default: Infinity */
  maxValue: number;

  /** Decay tick interval in miliseconds, default: 1000ms */
  interval: number;

  /** Decay type, default: DecayType.Linear */
  type: DecayType;
}

export class Decay extends EventEmitter {
  private timer?: NodeJS.Timer;
  private _value: number;
  private iter: number;

  private readonly interval: number;
  private readonly decayValue: number;
  private readonly minValue: number;
  private readonly maxValue: number;
  private readonly type: DecayType;

  constructor(config?: Partial<DecayConfig>) {
    super();
    if (!config) {
      config = {};
    }
    this._value =
      config.initialValue !== undefined ? Number(config.initialValue) : 1;
    this.decayValue =
      config.decayValue !== undefined ? Number(config.decayValue) : 1;
    this.minValue = config.minValue !== undefined ? Number(config.minValue) : 0;
    this.maxValue =
      config.maxValue !== undefined ? Number(config.maxValue) : Infinity;
    this.interval =
      config.interval !== undefined ? Number(config.interval) : 1000;
    this.type = config.type !== undefined ? config.type : DecayType.Linear;
    this.iter = 0;
  }

  increment(value?: number) {
    this.value += value !== undefined ? value : this.decayValue;
  }

  decrement(value?: number) {
    this.value -= value !== undefined ? value : this.decayValue;
  }

  get value() {
    return this._value;
  }

  set value(newValue: number) {
    this._value = Number(newValue);
    this.enforceMinMax();
  }

  start(): void {
    this.timer = setInterval(() => this.tick(), this.interval);
    this.emit("start", this.value);
  }

  stop(): number {
    this.iter = 0;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.emit("stop", this.value);
    return this.value;
  }

  async wait() {
    return new Promise((resolve, reject) => {
      if (!this.timer) {
        reject();
      }
      const resolver = (v: number) => {
        this.removeListener("min", resolver);
        this.removeListener("max", resolver);
        this.removeListener("stop", resolver);
        resolve(v);
      };
      this.once("min", resolver);
      this.once("max", resolver);
      this.once("stop", resolver);
    });
  }

  private tick(): void {
    if (this.type === DecayType.Exponential) {
      this.value -= this.decayValue * Math.E ** this.iter;
    } else {
      this.value -= this.decayValue;
    }
    this.iter++;
  }

  private enforceMinMax() {
    if (this.value > this.maxValue) {
      this.value = this.maxValue;
      this.emit("max", this.value);
      this.iter = 0;
    }
    if (this.value < this.minValue) {
      this.value = this.minValue;
      this.emit("min", this.value);
      this.iter = 0;
    }
  }
}
