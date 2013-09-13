/*jshint
    sub:true,
    curly: true,eqeqeq: true,
    immed: true,
    latedef: true,
    newcap: true,
    noarg: true,
    sub: true,
    undef: true,
    boss: true,
    eqnull: true,
    browser: true
*/

/*globals
    jQuery: false,
    require: false,
    exports: false,
    define: false,
    ko: false
*/

(function (factory) {
	// Module systems magic dance.

	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// CommonJS or Node: hard-coded dependency on "knockout"
		factory(require("knockout"), exports);
	} else if (typeof define === "function" && define["amd"]) {
		// AMD anonymous module with hard-coded dependency on "knockout"
		define(["knockout", "exports"], factory);
	} else {
		// <script> tag: use the global `ko` object, attaching a `mapping` property
		factory(ko, ko.protector = {});
	}
}(function (ko, exports) {

	if (typeof (ko) === undefined) {
		throw 'Knockout is required, please ensure it is loaded before loading this protector plug-in';
	}

	// create our namespace object
	var protector = exports;
	ko.protector = protector;
});