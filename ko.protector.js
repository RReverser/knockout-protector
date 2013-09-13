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
})(function (ko, protector) {

	if (ko === undefined) {
		throw 'Knockout is required, please ensure it is loaded before loading this protector plug-in';
	}

	// create our namespace object
	ko.protector = protector;

	ko.extenders.protector = function (target) {
		var protector = target.protector = ko.observable();
		var wasChanged = ko.observable(true);

		// pushing local changes to owner observable
		protector.accept = function (accept) {
			if (!wasChanged()) return;
			accept !== false ? target(protector()) : protector(target());
			wasChanged(false);
		};

		// reverting local changes to owner's state
		protector.revert = function () {
			protector.accept(false);
		};

		// committing all the third-party changes to temporary observable when it was not changed by user
		ko.computed(function () {
			if (wasChanged()) return;
			protector(target());
		});

		return target;
	};

	protector.isProtected = function (accessor) {
		return ko.isObservable(accessor.protector);
	};

	protector.traverse = function (viewModel, method, path) {
		for (var name in viewModel) {
			var value = viewModel[name];
			if (!value || value.nodeType) continue;

			if (ko.isObservable(value)) {
				if (protector.isProtected(value)) method(value, (path ? path + '.' : '') + name);
			} else {
				protector.traverse(value, method);
			}
		}
	};

	protector.accept = function (viewModel) {
		protector.traverse(viewModel, function (accessor) {
			accessor.protector.accept();
		});
	};

	protector.revert = function (viewModel) {
		protector.traverse(viewModel, function (accessor) {
			accessor.protector.revert();
		});
	};

	protector.getState = function (viewModel, callback) {
		var state = {};

		protector.traverse(viewModel, function (accessor, path) {
			state[path] = accessor.peek();
			if (callback) callback.apply(this, arguments);
		});

		return state;
	};

	protector.setState = function (viewModel, state) {
		protector.traverse(viewModel, function (accessor, path) {
			if (path in state) accessor(state[path]);
		});
	};

});