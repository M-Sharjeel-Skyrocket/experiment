odoo.define('pos_send_branch_orders.point_of_sale.screens', function (require) {
    "use strict";

var core = require('web.core');
var { Gui } = require('point_of_sale.Gui');
const PosComponent = require('point_of_sale.PosComponent');
const ProductScreen = require('point_of_sale.ProductScreen');
const Registries = require('point_of_sale.Registries');
const { useListener } = require("@web/core/utils/hooks");
//var screens = require('point_of_sale.screens');
//var floors = require('pos_restaurant.floors');
//var FloorScreenWidget = require('pos_restaurant.floors').FloorScreenWidget;

var rpc = require('web.rpc');

var _t = core._t;

//    screens.send_to_branch_button = screens.ActionButtonWidget.extend({ start
    class SendBranchButton extends PosComponent {
//        template: 'SendToBranchButton',
//        init: function (parent, options) {
//            this._super(parent, options);
    setup() {
            super.setup();
            useListener('click', this.button_click);
//            this.renderElement();
//            this.pos.bind('add remove change', function () {
//                this.renderElement();
//            }, this);
////
//            this.pos.bind('change:selectedOrder', function () {
//                this.renderElement();
//            }, this);
        }
//        renderElement () {
//            var self = this;
////            this._super();
//            if (this.env.pos.get_order()) {
//                if (this.env.pos.table && this.env.pos.table.floor) {
//                    if (this.env.pos.table.is_call_center) {
//                        $('.o_send_order_button').show()
//                    } else {
//                        $('.o_send_order_button').hide()
//                    }
//                }
//            }
//        }
       async button_click() {
             var order = this.env.pos.get_order()
            if (!order.get_partner()) {
                alert(_t("Customer is required for this transaction."));
                return;
            }
            order.set_initiate_sync(true)
            order.set_source_session_id(this.env.pos.pos_session.id)
//            this.pos.set_table(null)
            var order_uid = order.uid
            var orders_to_sync = this.env.pos.db.get_unpaid_orders_to_sync([order_uid]);
            var self = this;

            if (orders_to_sync.length) {
                this.env.pos.set_synch('connecting', orders_to_sync.length);
                this.env.pos._save_branch_order_to_server(orders_to_sync, {'draft': true}).then(function (server_ids) {
                console.log(server_ids)
//                   self.env.pos.removeOrder(order);
                }).catch(function(reason){
                    self.env.pos.set_synch('error');
                }).finally(function(){
//                            self.env.pos.setCurrentOrderToTransfer();
                            self.showScreen('FloorScreen');
//                    self.env.pos.transferTable(self.env.pos.table);
                });
            }

        }
}
//    }); end
     SendBranchButton.template ='SendToBranchButton';
//    screens.define_action_button({
//        'name': 'send_to_branch_button',
//        'widget': screens.send_to_branch_button,
//        'condition': function(){
//            return true;
//        },
//    });
ProductScreen.addControlButton({
    component: SendBranchButton,
    condition: function() {
        // Check if there's an order, a table, and the table has a floor and is a call center
        return this.env.pos.get_order() &&
               this.env.pos.table &&
               this.env.pos.table.floor &&
               this.env.pos.table.is_call_center;
    },
});

   Registries.Component.add(SendBranchButton);
   return SendBranchButton;
});
