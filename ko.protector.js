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

	ko.extenders.protector = function (frontend, element) {
		var backend = frontend.protector = ko.utils.extend(ko.observable(), {
			hasLocalChanges: ko.observable(false),
			accept: function () {
				if (!backend.hasLocalChanges()) return;
				backend(frontend());
				backend.hasLocalChanges(false);
			},
			revert: function () {
				if (!backend.hasLocalChanges()) return;
				frontend(backend());
				backend.hasLocalChanges(false);
			}
		});

		ko.computed(function () {
			if (!backend.hasLocalChanges()) backend(frontend());
		});

		frontend.subscribe(function () {
			backend.hasLocalChanges(true);
		});

		var viewModel = ko.dataFor(element.form);
		(viewModel.protectors || (viewModel.protectors = [])).push(backend);

		return frontend;
	};

	ko.bindingHandlers.protector = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var wrappedBingings = valueAccessor();

			for (var name in wrappedBingings) {
				wrappedBingings[name] = wrappedBingings[name].extend({protector: element});
			}

			ko.applyBindingsToNode(element, wrappedBingings);
		}
	};

	protector.accept = function (protectors) {
		ko.utils.arrayForEach(protectors, function (protector) {
			protector.accept();
		});
	};

	protector.revert = function (protectors) {
		ko.utils.arrayForEach(protectors, function (protector) {
			protector.revert();
		});
	};

	protector.getState = function (viewModel) {
		return ko.toJS(viewModel);
	};

	protector.setState = function (viewModel, state) {
		for (var name in state) {
			var vmValue = viewModel[name],
				stateValue = state[name];

			if (ko.isObservable(vmValue)) {
				vmValue(stateValue);
			} else
			if (typeof vmValue === 'object') {
				protector.setState(vmValue, stateValue);
			} else {
				viewModel[name] = stateValue;
			}
		}
	};

});