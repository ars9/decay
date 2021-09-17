# @ars9/decay

A simple class to store a numeric value that decays with time

Example:

```js
const { Decay } = require('@ars9/decay');

// Default configuration
const decay = new Decay({
  initialValue: 1,
  decayValue: 1,
  minValue: 0,
  maxValue: Infinity,
  interval: 1000,
  type: DecayType.Linear,
});

// Start decay
decay.start();
console.log(decay.value); // 1

// You can subscribe for an event when the decay hits the bottom
decay.on('min', (value) => console.log(value));

// You can subscribe for an event when the value maxes out (not in this case)
decay.on('max', (value) => console.log(value));

// You can subscribe for an event when the decay has been stopped manually
decay.on('stop', (value) => console.log(value));

// Wait for the value to decay to minumum value (or to be maxed out / stopped)
await decay.wait(); 
console.log(decay.value); // 0

// You can manually increment the value
decay.increment(10);
console.log(decay.value); // 10

// ...or decrement
decay.decrement(1);
console.log(decay.value); // 9

// Don't forget to stop decay to cleanup timers
decay.stop();
```
