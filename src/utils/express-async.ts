import { Express } from 'express';

/**
 * Patch express to handle errors from async fucntions
 *
 * Wrap all async route handler with promise catch
 *
 * @param app
 */
export function expressAsync(app: Express) {
  // make async functions safe
  const oldUse = app.use;
  app.use = function use(...args: any[]): any {
    const patchedArgs: any[] = [];
    // don't catch error handler fns
    args.forEach(handlerFn => {
      // is not a handler
      if (typeof handlerFn !== 'function') return patchedArgs.push(handlerFn);
      // is an error handler
      if (args.length > 3) return patchedArgs.push(handlerFn);
      // is a non-error handler
      // override with promise-safe handler
      return patchedArgs.push(function(req: any, res: any, next: any, ...more: any[]) {
        // (variadic arguments for the error handler would let args <= 3, so we
        // still have to allow for this function to be an error handler)
        const result = handlerFn(req, res, next, ...more);
        if (result instanceof Promise) result.catch(next);
        return result;
      })
    })
    return oldUse.call(app, ...patchedArgs as Parameters<Express['use']>);
  } as Express['use'];
}
