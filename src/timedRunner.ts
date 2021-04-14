export default async function timedRunner (func: any) {

  const start = Date.now();
  await func();

  const end = Date.now();
  const interval = end - start;

  console.log(`Finished in ${interval/1000} seconds`);
}
