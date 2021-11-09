type PromiseFunc = (...args: any[]) => Promise<any>;

export function serialPromise(promiseQueue: PromiseFunc[]) {
  let results: any[] = [];
  let promise = Promise.resolve();

  promise = promiseQueue.reduce((prevPromise, func, index) => {
    return prevPromise.then((res) => {
      if (index > 0) {
        results.push(res);
      }
      return func(res)
    }).catch((error) => {
      if (index === promiseQueue.length - 1) {
        return Promise.reject({
          step: results.length + 1,
          error,
        });
      }
      return Promise.reject(error);
    })
  }, promise);

  return promise.then(() => results);
}
