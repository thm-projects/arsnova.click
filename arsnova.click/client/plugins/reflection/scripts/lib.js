/**
 * @param strClass:
 *          class name
 * @param optionals:
 *          constructor arguments
 *
 * @source http://stackoverflow.com/a/6947194
 */
export function newInstance(strClass) {
	var args = Array.prototype.slice.call(arguments, 1);
	var clsClass = eval(strClass);
	console.log(clsClass);
	function F() {
		return clsClass.apply(this, args);
	}
	F.prototype = clsClass.prototype;
	return new F();
}
