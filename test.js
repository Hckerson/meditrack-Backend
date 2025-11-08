const ac = new AbortController();


ac.signal.addEventListener(
  'abort',
  () => {
    console.log('Aborted sir');
  },
  { once: true },
);




setTimeout(() => {
  ac.abort('I just feel like')
}, 3000);