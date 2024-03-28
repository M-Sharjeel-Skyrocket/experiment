odoo.define('skyrocket_restaurant_receipt.models', function (require) {
"use strict";

    var core = require('web.core');
    var PaymentScreen = require('point_of_sale.PaymentScreen');
    var { Order } = require('point_of_sale.models');
    var session = require('web.session');
    var field_utils = require('web.field_utils');
    const OrderReceipt = require('point_of_sale.OrderReceipt')
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;
    const PosComponent = require('point_of_sale.PosComponent');


    // _super_order Changing It.
    const CustomReceipt = (Order) => class CustomReceipt extends Order {
        constructor(obj, options) {
            super(...arguments);
            this.pos_mode = this.pos_mode || '';
        }

        export_as_JSON(){
            var json = super.export_as_JSON.apply(this, arguments);
            json.pos_mode = this.pos_mode;
            return json;
        }

        init_from_JSON(json){
            super.init_from_JSON.call(this, json);
            this.pos_mode = json.pos_mode;
        }

        set_pos_mode(mode) {
            this.pos_mode = mode;
        // this.trigger('change', this);
        }

        get_pos_mode() {
            return this.pos_mode;
        }

        getCurrentDateTime() {
            // Getting current date and time
            return this.currentDate = moment().format('DD-MMM-YY hh:mm');
        }
    }
    Registries.Model.extend(Order, CustomReceipt);

    // PaymentScreenWidget Changing
    const PaymentScreenWidget = (PaymentScreen) => class PaymentScreenWidget extends PaymentScreen {
        async validateOrder(isForceValidate) {
            this.env.pos.get_order().set_pos_mode("")
            return super.validateOrder(...arguments);
        }
    };
    Registries.Component.extend(PaymentScreen, PaymentScreenWidget);

    // session.module_list.indexOf("pos_restaurant") Overiding
//    const OrderReceiptGCC = OrderReceipt => class OrderReceiptGCC extends OrderReceipt {
//
//        get receiptEnv() {
//            let receipt_render_env = super.receiptEnv;
//            receipt_render_env.order.pos_mode = "Estimate";
//            return receipt_render_env;
//        }
//        };
//    Registries.Component.extend(OrderReceipt, OrderReceiptGCC);
//    return OrderReceiptGCC

    class OrderReceiptGCC extends PosComponent {
        get receiptEnv () {
            let receipt_render_env = super.receiptEnv;
            receipt_render_env.order.pos_mode = "Estimate";
            return this._receiptEnv;
        }
    }
    Registries.Component.add(OrderReceiptGCC);
    return OrderReceiptGCC;

});
