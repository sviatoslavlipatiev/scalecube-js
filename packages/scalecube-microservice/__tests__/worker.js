// onmessage = (data) => {
//   console.log('period2', data);
//
//   // let lastPostTime = Date.now();
//   // let counter = 0;
//   // postMessage(counter);
//   // while ( true ) {
//   //   const now = Date.now();
//   //   if ( lastPostTime + data === now ) {
//   //     lastPostTime = now;
//   //     counter++;
//   //     postMessage(counter);
//   //   }
//   // }
// };
onmessage = function(data) {
  console.log('period2', data);
  postMessage(data);
};
