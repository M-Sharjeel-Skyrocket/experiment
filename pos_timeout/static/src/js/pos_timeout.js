odoo.define("pos_timeout.models", function(require) {
    "use strict";

    var { PosGlobalState } = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    const Chrome = require('point_of_sale.Chrome');

//    const PosModelParent = (PosGlobalState) => class PosModelParent extends PosGlobalState {
//        // Send validated orders to the backend.
//        // Resolves to the backend ids of the synced orders.
//        _flush_orders(orders, options) {
//            var self = this;
//
//            return this._save_to_server(orders, options).then(function (server_ids) {
//                //                var timeout = self.config.pos_order_timeout;
//                //                if (timeout > 0 && orders && orders.length) {
//                //                    arguments[1].timeout = timeout * 1000 * orders.length;
//                //                }
//
//                for (let i = 0; i < server_ids.length; i++) {
//                    self.validated_orders_name_server_id_map[server_ids[i].pos_reference] = server_ids[i].id;
//                }
//                return server_ids;
//            }).catch(function(error) {
//                if (self._isRPCError(error)) {
//                    if (orders.length > 1) {
//                        return self._flush_orders_retry(orders, options);
//                    } else {
//                        self.set_synch('error');
//                        throw error;
//                    }
//                } else {
//                    self.set_synch('disconnected');
//                    throw error;
//                }
//            }).finally(function() {
//                self._after_flush_orders(orders);
//            });
//        }
//
//    }
//    Registries.Model.extend(PosGlobalState, PosModelParent);

    const PosResChrome = (Chrome) =>
        class extends Chrome {
            /**
             * @override
             */
            async start() {
                await super.start();
                if (this.env.pos.config.iface_floorplan) {
                    this._setActivityListeners();
                }
            }
            /**
             * @override
             */

            _setIdleTimer() {
                var timeout = this.env.pos.config.pos_order_timeout;
                clearTimeout(this.idleTimer);
                    if (this._shouldResetIdleTimer()) {
                    this.idleTimer = setTimeout(() => {
                        this._actionAfterIdle();
                    }, timeout);
                }
            }
        }

    Registries.Component.extend(Chrome, PosResChrome);
    return Chrome;

});
