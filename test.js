const ac = new AbortController();

ac.signal.addEventListener(
  'abort',
  () => {
    console.log('Aborted sir');
  },
  { once: true },
);


setTimeout(() => {
  ac.abort()
}, 10000);