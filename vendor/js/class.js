// Dependency of this library:
// ECMAScript 5: use the es5-shim in older browsers

var Class = {

    //---------- Inheritance API

    /**
     */
    extend: function (properties) {
        var superProto = this.prototype || Class;
        var proto = Object.create(superProto);
        // This method will be attached to many constructor functions
        // => must refer to "Class" via its global name (and not via "this")
        Class.copyOwnTo(properties, proto);
        
        var constr = proto.constructor;
        if (!(constr instanceof Function)) {
            throw new Error("You must define a method 'constructor'");
        }
        // Set up the constructor
        constr.prototype = proto;
        constr.super = superProto;
        constr.extend = this.extend; // inherit class method
        return constr;
    },

    /**
     */
    copyOwnTo: function(source, target) {
        Object.getOwnPropertyNames(source).forEach(function(propName) {
            Object.defineProperty(target, propName,
                Object.getOwnPropertyDescriptor(source, propName));
        });
        return target;
    }
};