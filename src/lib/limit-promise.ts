type PromiseFunc = (...args: any[]) => Promise<any>;

export async function limitPromise(concurrent: number, promiseQueue: PromiseFunc[]) {
  const results: Promise<PromiseSettledResult<any>>[] = [];
  const executing: Promise<void>[] = [];

  while (promiseQueue.length > 0) {
    const promise = promiseQueue.shift() as PromiseFunc;

    const p = Promise.resolve().then(
      () => Promise.allSettled([promise()]).then((res) => res[0])
    );
    results.push(p);

    const execute = p.then(() => {
      const index = executing.indexOf(execute);
      executing.splice(index, 1)
    });
    executing.push(execute);

    if (executing.length >= concurrent) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

export function limitPromise2(concurrent: number, promiseQueue: PromiseFunc[]) {
  const results: Promise<PromiseSettledResult<any>>[] = [];
  const executing: Promise<void>[] = [];

  function enqueue(): Promise<void> {
    const promise = promiseQueue.shift();

    if (!promise) {
      return Promise.resolve();
    }

    const p = Promise.resolve().then(
      () => Promise.allSettled([promise()]).then((res) => res[0])
    );
    results.push(p);

    let r = Promise.resolve();

    const execute = p.then(() => {
      const index = executing.indexOf(execute);
      executing.splice(index, 1)
    });
    executing.push(execute);

    if (executing.length >= concurrent) {
      r = Promise.race(executing);
    }

    return r.then(() => enqueue());
  }

  return enqueue().then(() => Promise.all(results));
}
