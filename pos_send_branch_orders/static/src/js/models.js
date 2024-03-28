odoo.define('pos_send_branch_orders.point_of_sale.models', function (require) {
    "use strict";

    const { PosModel } = require('point_of_sale.models');
    var { PosGlobalState, Order } = require('point_of_sale.models');
    const rpc = require('web.rpc');
    const session = require('web.session');
    const Registries = require('point_of_sale.Registries');
    const SendBranchPosGlobalState = (PosGlobalState) => class extends PosGlobalState {
//    async _processData(loadedData) {
//        await super._processData(...arguments);
//            this.table = loadedData['restaurant.table'];
//    }
//        _extendModels() {
//            const floorModel = this.models.find(model => model.model === 'restaurant.floor');
//            if (floorModel) {
//                floorModel.fields.push('is_call_center');
//            }
//
//            const tableModel = this.models.find(model => model.model === 'restaurant.table');
//            if (tableModel) {
//                tableModel.fields.push('is_call_center', 'destination_table', 'destination_config_id');
//            }
//        }

//        _save_branch_order_to_server(orders, options = {}) {
//        if (!orders || !orders.length) {
//            return Promise.resolve([]);
//        }
//        this.set_synch('connecting', orders.length);
//        options = options || {};
//
//        var self = this;
//        var timeout = typeof options.timeout === 'number' ? options.timeout : 30000 * orders.length;
//
//        // Keep the order ids that are about to be sent to the
//        // backend. In between create_from_ui and the success callback
//        // new orders may have been added to it.
//        var order_ids_to_sync = _.pluck(orders, 'id');
//
//        // we try to send the order. shadow prevents a spinner if it takes too long. (unless we are sending an invoice,
//        // then we want to notify the user that we are waiting on something )
//        var args = [_.map(orders, function (order) {
//                order.to_invoice = options.to_invoice || false;
//                return order;
//            })];
//        args.push(options.draft || false);
//        return this.env.services.rpc({
//                model: 'pos.order',
//                method: 'create_from_ui',
//                args: args,
//                kwargs: {context: this.env.session.user_context},
//            }, {
//                timeout: timeout,
//                shadow: !options.to_invoice
//            })
//            .then(function (server_ids) {
//                _.each(order_ids_to_sync, function (order_id) {
//                    self.db.remove_order(order_id);
//                });
//                self.failed = false;
//                self.set_synch('connected');
//                return server_ids;
//            }).catch(function (error){
//                console.warn('Failed to send orders:', orders);
//                if(error.code === 200 ){    // Business Logic Error, not a connection problem
//                    // Hide error if already shown before ...
//                    if ((!self.failed || options.show_error) && !options.to_invoice) {
//                        self.failed = error;
//                        self.set_synch('error');
//                        throw error;
//                    }
//                }
//                self.set_synch('disconnected');
//                throw error;
//            });
//    }

//        _handleOrderSyncFailure(error, orders, options) {
//            if (error.code === 200) {
//                if (error.data.exception_type === 'warning') {
//                    delete error.data.debug;
//                }
//
//                if ((!this.get('failed') || options.show_error) && !options.to_invoice) {
//                    this.gui.show_popup('error-traceback', {
//                        'title': error.data.message,
//                        'body': error.data.debug
//                    });
//                }
//                this.set('failed', error);
//            }
//            console.warn('Failed to send orders:', orders);
//            this.gui.show_sync_error_popup();
//        }
    };

    const OrderExtension = (Order) => class extends Order {
        constructor(attr, options) {
            super(attr, options);
            this.initiate_sync = false;
            this.source_session_id = false;
        }

        export_as_JSON() {
            const json = super.export_as_JSON();
            json.initiate_sync = this.initiate_sync;
            json.source_session_id = this.source_session_id;
            return json;
        }

        init_from_JSON(json) {
            super.init_from_JSON(json);
            this.initiate_sync = json.initiate_sync;
            this.source_session_id = json.source_session_id;
        }

        set_initiate_sync(bol) {
            this.initiate_sync = bol;
//            this.trigger('change', this);
        }

        set_source_session_id(val) {
            this.source_session_id = val;
//            this.trigger('change', this);
        }
    };

//    PosModel.registry.add(PosModelExtension);
    Registries.Model.extend(PosGlobalState, SendBranchPosGlobalState);
//    Order.registry.add(OrderExtension);
    Registries.Model.extend(Order,OrderExtension);
});
