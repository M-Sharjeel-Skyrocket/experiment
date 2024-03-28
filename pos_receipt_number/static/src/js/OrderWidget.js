/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_selection.CustomOrderWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderWidget = require("point_of_sale.OrderWidget");

    const PosRefrenececOrderWidget = (OrderWidget) => class extends OrderWidget {
        setup() {
            super.setup();
        }
        orderwidget_pos_reference_number (){
            if (!this.order.get_orderlines().length) {
                return;
            }
             if (this.order.pos_sequence_number == 0 && this.order.pos_reference_number == '/' && this.env.pos.hasOwnProperty('table')) {
                // We are preventing to generate receipt # for call center orders
                if (this.env.pos.table.is_call_center == true) {
                    return
                }
                var next_sequence = Math.max.apply(Math, _.map(this.env.pos.db.get_unpaid_orders(), function(o){return o.pos_sequence_number}).concat(this.env.pos.pos_session.current_sequence_number))
                next_sequence++
                this.env.pos.pos_session.current_sequence_number = next_sequence
                this.order.set_pos_sequence_number(next_sequence, this.order.generate_pos_reference_number())
            }
        }
//            orderwidget_pos_reference_number {
//            if (!this.order.get_orderlines().length) {
//                return;
//            }
//            if (this.order.pos_sequence_number == 0 && order.pos_reference_number == '/' && this.order.hasOwnProperty('table')) {
//                // We are preventing to generate receipt # for call center orders
//                if (this.order.table.is_call_center == true) {
//                    return
//                }
//                var next_sequence = Math.max.apply(Math, _.map(this.pos.db.get_unpaid_orders(), function(o){return o.pos_sequence_number}).concat(this.pos.pos_session.current_sequence_number))
//                next_sequence++
//                this.pos.pos_session.current_sequence_number = next_sequence
//                this.order.set_pos_sequence_number(next_sequence, this.order.generate_pos_reference_number())
//            }
     };
            /**
             * @override
             */
//            async _editPackLotLines(event) {
//                const orderline = event.detail.orderline;
//                this.env.session.lots = await this.env.pos.getProductLots(
//                    orderline.product
//                );
//                const res = await super._editPackLotLines(...arguments);
//                this.env.session.lots = undefined;
//                return res;
//            }


    Registries.Component.extend(OrderWidget, PosRefrenececOrderWidget);
    return OrderWidget;
});
