odoo.define('pos_customer_required.pos_customer_required', function (require) {
    "use strict";

    var PaymentScreen = require('point_of_sale.PaymentScreen');
    var core = require('web.core');
    var _t = core._t;
    const Registries = require('point_of_sale.Registries');

    const PaymentScreenWidget = (PaymentScreen) => class PaymentScreenWidget extends PaymentScreen {
        async validateOrder(isForceValidate) {
            if(this.env.pos.config.require_customer && !this.env.pos.get_order().get_partner()){
                this.showPopup('ErrorPopup', {
                    title: _t('An anonymous order cannot be confirmed'),
                    body:  _t('Please select a customer for this order.'),
                });
                return;
            }
            return super.validateOrder(...arguments);
        }
    };
    Registries.Component.extend(PaymentScreen, PaymentScreenWidget);

    /*
        Because of client list screen behaviour, it is not possible to simply
        use: set_default_screen('clientlist') + remove cancel button on
        customer screen.

        Instead of,
        - we overload the function : show_screen(screen_name,params,refresh),
        - and we replace the required screen by the 'clientlist' screen if the
        current PoS Order has no Customer.
    */
});
