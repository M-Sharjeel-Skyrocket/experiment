odoo.define('pos_receipt_number.pos', function(require) {
	"use strict";

//	var models = require('point_of_sale.models');
//	var screens = require('point_of_sale.screens');
//	var chrome = require('point_of_sale.chrome');
//	var ScreenWidget = require('point_of_sale.screens').ScreenWidget;
	var core = require('web.core');
	var _t = core._t;
	var { Order } = require('point_of_sale.models');
    const rpc = require('web.rpc');
    const session = require('web.session');
    const Registries = require('point_of_sale.Registries');

//    models.load_fields("pos.session", ["current_sequence_number"]);

//    var _super_order = models.Order.prototype;
//    models.Order = models.Order.extend({
    const PosReceiptNumber = (Order) => class PosReceiptNumber extends Order {
        constructor(obj, options) {
            super(...arguments);
            // _super_order.initialize.call(this,attr,options);
            this.pos_sequence_number = this.pos_sequence_number || 0;
            this.pos_reference_number = this.pos_reference_number || '/';
        }
        export_as_JSON (){
            // var json = _super_order.export_as_JSON.apply(this, arguments);
            const json = super.export_as_JSON(...arguments);
            json.pos_sequence_number = this.pos_sequence_number || 0;
            json.pos_reference_number = this.pos_reference_number || '/';
            return json;
        }
        init_from_JSON (json){
            super.init_from_JSON(...arguments);
            this.pos_sequence_number = json.pos_sequence_number || 0;
            this.pos_reference_number = json.pos_reference_number || '/';
        }

        set_pos_sequence_number (pos_sequence_number, pos_reference_number) {
            this.pos_sequence_number = pos_sequence_number;
            this.pos_reference_number = pos_reference_number;
            // this.trigger('change', this);
        }

            //        generate_pos_reference_number () {
            //            function zero_pad(num, size){
            //                var s = ""+num;
            //                while (s.length < size) {
            //                    s = "0" + s;
            //                }
            //                return s;
            //            }
            //            return zero_pad(this.pos.pos_session.id,5) +'-'+ zero_pad(this.pos.pos_session.current_sequence_number,4);
            //        }
    }


            //    screens.OrderWidget.include({
            //        update_summary: function(){
            //            this._super();
            //            var order = this.pos.get_order();
            //            if (!order.get_orderlines().length) {
            //                return;
            //            }
            //            if (order.pos_sequence_number == 0 && order.pos_reference_number == '/' && order.hasOwnProperty('table')) {
            //                // We are preventing to generate receipt # for call center orders
            //                if (order.table.is_call_center == true) {
            //                    return
            //                }
            //                var next_sequence = Math.max.apply(Math, _.map(this.pos.db.get_unpaid_orders(), function(o){return o.pos_sequence_number}).concat(this.pos.pos_session.current_sequence_number))
            //                next_sequence++
            //                this.pos.pos_session.current_sequence_number = next_sequence
            //                order.set_pos_sequence_number(next_sequence, order.generate_pos_reference_number())
            //            }
            //        },
            //    });
   Registries.Model.extend(Order,PosReceiptNumber);
});
