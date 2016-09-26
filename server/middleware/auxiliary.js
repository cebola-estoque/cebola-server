/**
 * Evaluates the option against request if it is a Function
 * Otherwise simply returns the option's value itself.
 * 
 * @param  {*} opt
 * @param  {Express Request} req
 * @return {*}
 */
exports.evalOpt = function evalOpt(opt, req) {
  return (typeof opt === 'function') ? opt(req) : opt;
}
